import { OnchainWalletConnect } from "@/components/blockchain/onchain-wallet-connect"
import { OnchainProviderWrapper } from "@/components/blockchain/onchain-provider-wrapper"

export const metadata = {
  title: "OnchainKit Wallet | BaseHealth",
  description: "Connect your wallet using OnchainKit to access healthcare services",
}

export default function OnchainWalletPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">OnchainKit Wallet Integration</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* Client component with provider wrapper */}
          <OnchainProviderWrapper>
            <OnchainWalletConnect />
          </OnchainProviderWrapper>
        </div>
        <div className="space-y-4">
          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">About OnchainKit</h2>
            <p className="text-muted-foreground">
              OnchainKit provides ready-to-use, full-stack components to make building onchain apps faster and easier.
              This integration allows you to connect your wallet and interact with the Base blockchain network.
            </p>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Features</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Easy wallet connection</li>
              <li>View wallet address details</li>
              <li>Check token holdings</li>
              <li>Perform wallet actions</li>
              <li>Execute transactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
