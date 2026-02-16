import { redirect } from "next/navigation"

export default function WalletPage() {
  // The app uses a wallet-first sign-in in the global nav. Keep `/wallet` as a legacy alias.
  redirect("/patient-portal")
}

