import Link from "next/link"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to home
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Security</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: February 16, 2026</p>

        <div className="mt-8 space-y-8 text-sm text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Platform safeguards</h2>
            <p className="mt-2">
              BaseHealth applies layered controls including authenticated access, role-based restrictions, monitoring, and
              audit trails for sensitive operations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Data protection</h2>
            <p className="mt-2">
              We use encryption in transit and standard secure development practices designed to reduce risk to user and
              operational data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Operational controls</h2>
            <p className="mt-2">
              Privileged workflows are restricted to authorized admin identity checks and are not exposed as public UI
              actions for regular users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Report a security issue</h2>
            <p className="mt-2">
              To report a vulnerability, contact{" "}
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
