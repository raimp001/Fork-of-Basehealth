import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to home
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Effective date: February 16, 2026</p>

        <div className="mt-8 space-y-8 text-sm text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Information we collect</h2>
            <p className="mt-2">
              We may collect profile information you provide, wallet addresses used for authentication, transaction
              metadata for payments, and application details submitted for provider or caregiver onboarding.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">How we use information</h2>
            <p className="mt-2">
              We use information to operate the app, process onboarding and care workflows, improve product reliability,
              and communicate essential service updates.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Data sharing</h2>
            <p className="mt-2">
              We do not sell personal data. We share only what is needed with service providers (for example hosting,
              email, analytics, or payment infrastructure) to run BaseHealth.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Retention and security</h2>
            <p className="mt-2">
              We retain data for operational, legal, and compliance needs and apply technical and organizational controls
              designed to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Contact</h2>
            <p className="mt-2">
              For privacy requests, email{" "}
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
