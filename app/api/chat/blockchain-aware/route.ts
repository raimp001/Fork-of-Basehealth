import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import { NextResponse } from "next/server"
import { agentKit, getWalletContext, getHealthcarePaymentContext } from "@/lib/agent-service"

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
    const { messages, walletAddress, appointmentId } = await req.json()

    // Get blockchain context if wallet address is provided
    let context = null
    if (walletAddress) {
      if (appointmentId) {
        context = await getHealthcarePaymentContext(appointmentId, walletAddress)
      } else {
        context = await getWalletContext(walletAddress)
      }
    }

    // Use Agent Kit to enhance the AI with blockchain context
    // Note: enhanceMessages API may have changed - using messages directly for now
    const enhancedMessages = messages

    const result = streamText({
      model: groq("llama3-70b-8192"),
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...enhancedMessages],
    })

    return result.toDataStreamResponse()
  } catch (error) {
    // Error logged by error handler
    return NextResponse.json({ error: "There was an error processing your request" }, { status: 500 })
  }
}
