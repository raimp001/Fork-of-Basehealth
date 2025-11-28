import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import { NextResponse } from "next/server"
import { sanitizeInput } from "@/lib/phiScrubber"

// System prompt that defines the AI's behavior with MCP server integration
const SYSTEM_PROMPT = `You are a helpful health assistant for the BaseHealth platform with blockchain awareness powered by the Model Context Protocol server.
You can use blockchain tools to provide real-time information about transactions, wallets, and healthcare payments on the Base network.

Important guidelines:
- Use the blockchain tools when users ask about payments, transactions, or wallet information
- Provide evidence-based health information following medical best practices
- Never diagnose specific conditions - instead suggest talking to a healthcare provider
- For serious symptoms, always recommend seeking immediate medical attention
- Explain blockchain concepts in simple terms for patients

Available blockchain tools:
- getWalletBalance: Get the balance of a wallet address on Base
- getTransactionDetails: Get details about a specific transaction
- getPaymentHistory: Get healthcare payment history for a wallet
- verifyPayment: Verify if a payment for a healthcare service was completed`

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

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
      console.log(`[MCP Chat API] Scrubbed ${userMessages.length} user message(s) for PHI`)
    }

    const result = streamText({
      model: groq("llama3-70b-8192"),
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...scrubbedMessages],
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in MCP server chat API:", error)
    return NextResponse.json({ error: "There was an error processing your request" }, { status: 500 })
  }
}
