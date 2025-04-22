import { BlockchainProviderSearch } from "@/components/provider/blockchain-provider-search"

export const metadata = {
  title: "Find Blockchain-Enabled Healthcare Providers",
  description: "Search for healthcare providers who accept cryptocurrency payments on Base",
}

export default function BlockchainProviderSearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Blockchain-Enabled Providers</h1>
      <BlockchainProviderSearch />
    </div>
  )
}
