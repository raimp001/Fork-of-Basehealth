import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to home
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Effective date: February 16, 2026</p>

        <div className="mt-8 space-y-8 text-sm text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Use of BaseHealth</h2>
            <p className="mt-2">
              By using BaseHealth, you agree to use the platform lawfully and only for personal or authorized clinical
              workflows.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Medical disclaimer</h2>
            <p className="mt-2">
              BaseHealth provides informational support and workflow tooling. It is not a diagnosis service and does not
              replace licensed medical judgment or emergency care.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Accounts and access</h2>
            <p className="mt-2">
              You are responsible for maintaining control of your wallet and device access. Do not share credentials,
              seed phrases, or private keys.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Payments and refunds</h2>
            <p className="mt-2">
              Certain features may involve on-chain or card-based payments. Refund handling depends on the related
              provider policy and applicable payment flow.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Changes</h2>
            <p className="mt-2">
              We may update these terms from time to time. Continued use after changes are posted means you accept the
              updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Contact</h2>
            <p className="mt-2">
              Questions about these terms can be sent to{" "}
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
