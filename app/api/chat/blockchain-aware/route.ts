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

// System prompt that defines the AI's behavior and knowledge with blockchain awareness
const SYSTEM_PROMPT = `You are a helpful health assistant for the BaseHealth platform with blockchain awareness. 
You provide general health information, guidance to patients, and can explain blockchain transactions related to healthcare payments.

Important guidelines:
- Provide evidence-based information following medical best practices
- Never diagnose specific conditions - instead suggest talking to a healthcare provider
- For serious symptoms, always recommend seeking immediate medical attention
- You can explain blockchain transactions in simple terms for patients
- You can help users understand their healthcare payment history on the Base blockchain
- When discussing payments, explain the benefits of blockchain for healthcare: transparency, reduced fees, and security

If asked about blockchain or crypto payments:
- Explain that BaseHealth uses the Base blockchain for secure, transparent payments
- Payments are made in ETH (Ethereum) on the Base network
- Transactions are secure, fast, and have lower fees than traditional payment methods
- Patients can view their complete payment history on the blockchain
- Providers receive payments directly to their wallet addresses
- The system maintains privacy while ensuring payment transparency`

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, walletAddress, appointmentId, agent: requestedAgent } = body || {}

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages must be a non-empty array" }, { status: 400 })
    }

    const scrubbedMessages = messages.map((msg: any) => {
      if (msg.role === "user" && typeof msg.content === "string") {
        const { cleanedText } = sanitizeInput(msg.content)
        return { ...msg, content: cleanedText }
      }
      return msg
    })

    // Get blockchain context if wallet address is provided
    let context: Record<string, unknown> | null = null
    if (typeof walletAddress === "string" && walletAddress.trim()) {
      if (typeof appointmentId === "string" && appointmentId.trim()) {
        context = await getHealthcarePaymentContext(appointmentId, walletAddress)
      } else {
        context = await getWalletContext(walletAddress)
      }
    }

    const selectedAgent = resolveAgent(scrubbedMessages, requestedAgent, "billing-guide")
    const systemPrompt = buildAgentSystemPrompt(selectedAgent, SYSTEM_PROMPT, context)
    const enhancedMessages = agentKit.enhanceMessages(scrubbedMessages, {
      agent: selectedAgent,
      context,
    })

    const openClawModel = getOpenClawModel(selectedAgent)
    const model = openClawModel || groq("llama3-70b-8192")
    const provider = openClawModel ? "openclaw" : "groq"

    logger.info("Blockchain-aware chat request routed", {
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
    logger.error("Error in blockchain-aware chat API", error)
    return NextResponse.json({ error: "There was an error processing your request" }, { status: 500 })
  }
}
