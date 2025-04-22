import { SimplifiedWalletConnect } from "@/components/blockchain/simplified-wallet-connect"

export const metadata = {
  title: "Connect Wallet | BaseHealth",
  description: "Connect your Ethereum wallet to access healthcare services and make payments",
}

export default function WalletPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Connect Your Wallet</h1>
      <SimplifiedWalletConnect />
    </div>
  )
}
