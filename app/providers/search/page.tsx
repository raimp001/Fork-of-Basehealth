import { SimplifiedProviderSearch } from "@/components/provider/simplified-provider-search"

export const metadata = {
  title: "Find Providers | BaseHealth",
  description: "Search for healthcare providers by specialty and location",
}

export default function ProviderSearchPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Find Healthcare Providers</h1>
      <SimplifiedProviderSearch />
    </div>
  )
}
