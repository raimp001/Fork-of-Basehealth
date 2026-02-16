import { redirect } from "next/navigation"

export default function BasePaymentPage() {
  // Payments UI is intentionally minimal for launch; direct users to receipts/billing.
  redirect("/billing")
}

