import { NextResponse } from "next/server"
import { createPublicClient, formatUnits, http, isAddress, type Address } from "viem"
import { base, baseSepolia } from "viem/chains"
import { ACTIVE_CHAIN, PAYMENT_CONFIG } from "@/lib/network-config"

const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const

export async function GET() {
  try {
    const treasuryAddressRaw = PAYMENT_CONFIG.recipientAddress
    if (!treasuryAddressRaw || !isAddress(treasuryAddressRaw)) {
      return NextResponse.json(
        {
          success: false,
          error: "Treasury address is not configured",
          help: "Set NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS to a valid 0x address.",
        },
        { status: 400 },
      )
    }

    const chain = ACTIVE_CHAIN.id === base.id ? base : baseSepolia
    const client = createPublicClient({
      chain,
      transport: http(ACTIVE_CHAIN.rpcUrls.default),
    })

    const treasuryAddress = treasuryAddressRaw as Address
    const [ethBalance, usdcBalance] = await Promise.all([
      client.getBalance({ address: treasuryAddress }),
      client.readContract({
        address: ACTIVE_CHAIN.contracts.usdc as Address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [treasuryAddress],
      }),
    ])

    return NextResponse.json(
      {
        success: true,
        generatedAt: new Date().toISOString(),
        network: {
          name: ACTIVE_CHAIN.name,
          chainId: ACTIVE_CHAIN.id,
          explorer: ACTIVE_CHAIN.blockExplorers.default,
        },
        treasuryAddress,
        balances: {
          eth: {
            raw: ethBalance.toString(),
            formatted: formatUnits(ethBalance, 18),
          },
          usdc: {
            raw: usdcBalance.toString(),
            formatted: formatUnits(usdcBalance, 6),
          },
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    console.error("Treasury balances error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load treasury balances",
      },
      { status: 500 },
    )
  }
}

