import Link from "next/link"

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to home
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Company</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          BaseHealth is building a simpler healthcare experience with wallet-based access, evidence-based guidance, and
          secure care coordination tools.
        </p>

        <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">What we do</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We help people discover screenings, find providers, and manage care workflows in one place. We design for
              clarity, reliability, and patient safety.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              For support, email{" "}
              <a href="mailto:basehealthapp@gmail.com" className="text-foreground underline underline-offset-4">
                basehealthapp@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
