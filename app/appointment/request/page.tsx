import { redirect } from "next/navigation"

export default function AppointmentRequestPage() {
  // On-demand appointment flows are not launched; route to the assistant instead.
  redirect("/chat?q=Help%20me%20find%20the%20right%20provider%20and%20next%20steps%20for%20booking%20care.")
}

