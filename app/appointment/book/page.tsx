import { redirect } from "next/navigation"

export default function AppointmentBookIndexPage() {
  // Appointment booking UI is not launched; provider search is the current entry point.
  redirect("/providers/search")
}

