import { redirect } from "next/navigation"

export default function PracticeHubPage() {
  // Practice hub orchestration UI is not production-ready for external use.
  redirect("/chat?ops=1")
}

