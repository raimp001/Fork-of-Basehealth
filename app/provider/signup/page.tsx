import { redirect } from "next/navigation"

/**
 * Redirect to new onboarding wizard
 * Old URL: /provider/signup
 * New URL: /onboarding (with provider pre-selected)
 */
export default function ProviderSignupRedirect() {
  redirect("/onboarding?role=provider")
}
