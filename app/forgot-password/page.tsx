import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Password reset via email is not enabled yet. You can sign in with your Base wallet, or contact support to
          recover email-based access.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Back to sign in
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium"
          >
            Contact support
          </Link>
        </div>
      </main>
    </div>
  )
}

