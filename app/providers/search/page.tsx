import { ProviderSearch } from "@/components/provider/provider-search"

export const metadata = {
  title: "Find Providers | BaseHealth",
  description: "Search for healthcare providers by specialty and location",
}

export default function ProvidersSearchPage() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">Find a Provider</h1>
      <p className="text-center text-muted-foreground mb-8">Search for healthcare providers by city, area, or ZIP code. Book a virtual or in-person appointment.</p>
      <ProviderSearch />
    </div>
  )
}
