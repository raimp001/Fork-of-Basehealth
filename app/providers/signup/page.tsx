import { redirect } from "next/navigation"

/**
 * Redirect to new onboarding wizard
 * Old URL: /providers/signup
 * New URL: /onboarding (with provider pre-selected)
 */
export default function ProvidersSignupRedirect() {
  redirect("/onboarding?role=provider")
}
