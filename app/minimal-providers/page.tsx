import { redirect } from "next/navigation"

export default function MinimalProvidersRedirectPage() {
  redirect("/providers/search")
}

