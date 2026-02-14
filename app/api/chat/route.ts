import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import { NextResponse } from "next/server"
import { sanitizeInput } from "@/lib/phiScrubber"
import { logger } from "@/lib/logger"
import {
  agentKit,
  buildAgentSystemPrompt,
  getHealthcarePaymentContext,
  getOpenClawModel,
  getWalletContext,
  resolveAgent,
} from "@/lib/agent-service"

// System prompt that defines the AI's behavior and knowledge
const SYSTEM_PROMPT = `You are a helpful health assistant for the BaseHealth platform. 
You provide general health information and guidance to patients. 

Important guidelines:
- Provide evidence-based information following medical best practices
- Never diagnose specific conditions - instead suggest talking to a healthcare provider
- For serious symptoms, always recommend seeking immediate medical attention
- Reference USPSTF guidelines for screening recommendations when appropriate
- You can suggest finding providers on the platform for follow-up care
- Be friendly, empathetic, and concise in your responses
- You can suggest health screenings based on age, gender, and risk factors
- When appropriate, mention that you can connect users with healthcare providers through the platform

If asked about screenings, you can refer to these common recommendations:
- Mammograms for women 40-74 years old every 1-2 years
- Colonoscopy for adults 45-75 years old every 10 years
- Pap smears for women 21-65 years old every 3 years
- Blood pressure screening for adults 18+ yearly
- Cholesterol screening for adults 20+ every 4-6 years
- Diabetes screening for adults 45+ every 3 years
- Skin cancer screening for adults yearly
- Lung cancer screening for adults 50-80 with smoking history yearly

If the user asks about finding providers or scheduling appointments, explain that they can use the BaseHealth platform to find providers by specialty and location, schedule telemedicine appointments, and pay using cryptocurrency.`

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, agent: requestedAgent, walletAddress, appointmentId } = body || {}

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages must be a non-empty array" }, { status: 400 })
    }

    // IMPORTANT: Scrub PHI from user messages before sending to LLM
    const scrubbedMessages = messages.map((msg: any) => {
      if (msg.role === "user" && typeof msg.content === "string") {
        const { cleanedText } = sanitizeInput(msg.content)
        return { ...msg, content: cleanedText }
      }
      return msg
    })

    // Log that scrubbing occurred (but NOT the original content)
    const userMessages = messages.filter((m: any) => m.role === "user")
    if (userMessages.length > 0) {
      logger.debug(`Scrubbed ${userMessages.length} user message(s) for PHI`)
    }

    const selectedAgent = resolveAgent(scrubbedMessages, requestedAgent)

    let context: Record<string, unknown> | null = null
    if (typeof walletAddress === "string" && walletAddress.trim()) {
      if (typeof appointmentId === "string" && appointmentId.trim()) {
        context = await getHealthcarePaymentContext(appointmentId, walletAddress)
      } else {
        context = await getWalletContext(walletAddress)
      }
    }

    const systemPrompt = buildAgentSystemPrompt(selectedAgent, SYSTEM_PROMPT, context)
    const enhancedMessages = agentKit.enhanceMessages(scrubbedMessages, {
      agent: selectedAgent,
      context,
    })

    const openClawModel = getOpenClawModel(selectedAgent)
    const model = openClawModel || groq("llama3-70b-8192")
    const provider = openClawModel ? "openclaw" : "groq"

    logger.info("Chat request routed", {
      provider,
      agent: selectedAgent,
      hasContext: Boolean(context),
    })

    const result = streamText({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...enhancedMessages],
    })

    const response = result.toDataStreamResponse()
    response.headers.set("x-basehealth-agent", selectedAgent)
    response.headers.set("x-basehealth-llm-provider", provider)
    return response
  } catch (error) {
    logger.error("Error in chat API", error)
    return NextResponse.json({ error: "There was an error processing your request" }, { status: 500 })
  }
}

// Function to analyze symptoms and provide recommendations (internal use only)
async function analyzeSymptoms(symptoms: string, age: number, gender: string, additionalContext = "") {
  // IMPORTANT: Scrub PHI from input before sending to LLM
  const { cleanedText: scrubbedSymptoms } = sanitizeInput(symptoms)
  const { cleanedText: scrubbedContext } = sanitizeInput(additionalContext)
  
  const prompt = `
    Patient information:
    - Age: ${age}
    - Gender: ${gender}
    - Reported symptoms: ${scrubbedSymptoms}
    - Additional context: ${scrubbedContext}
    
    Based on the above information, please provide:
    1. What are possible causes for these symptoms that should be discussed with a healthcare provider?
    2. What type of healthcare specialist might be most appropriate to consult? 
    3. Is this something that requires immediate medical attention, timely follow-up, or routine care?
    4. Any appropriate home care suggestions while waiting to see a healthcare provider?
    5. Any relevant screening tests that might be appropriate based on USPSTF guidelines given the patient's age and gender?
    
    Format your response as JSON with the following structure:
    {
      "possibleCauses": ["cause1", "cause2", ...],
      "recommendedSpecialty": "specialty",
      "urgencyLevel": "immediate|timely|routine",
      "homeCare": ["suggestion1", "suggestion2", ...],
      "recommendedScreenings": ["screening1", "screening2", ...],
      "furtherQuestions": ["question1", "question2", ...]
    }
  `

  try {
    const result = await streamText({
      model: groq("llama3-70b-8192"),
      prompt: prompt,
      system:
        "You are a medical assistant AI that provides structured information about symptoms. Always respond in valid JSON format.",
    })

    // Get text from stream result
    const text = await result.text

    // Parse the JSON response
    return JSON.parse(text)
  } catch (error) {
    logger.error("Error analyzing symptoms", error)
    throw new Error("Failed to analyze symptoms. Please try again later.")
  }
}
