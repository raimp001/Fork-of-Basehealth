import { redirect } from "next/navigation"

/**
 * Redirect to new onboarding wizard
 * Old URL: /providers/caregiver-signup
 * New URL: /onboarding (with caregiver pre-selected)
 */
export default function CaregiverSignupRedirect() {
  redirect("/onboarding?role=caregiver")
}
