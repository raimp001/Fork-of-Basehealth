import Link from "next/link"

export default function SecondOpinionResultsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Second Opinion Request Received</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your request was submitted. A provider will review the details and share follow-up guidance in-app.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/second-opinion"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium"
          >
            Submit another request
          </Link>
          <Link
            href="/patient-portal"
            className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Go to patient portal
          </Link>
        </div>
      </main>
    </div>
  )
}

