"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { AlertCircle, ArrowRight, Lock, Mail } from "lucide-react"

import { SignInWithBase } from "@/components/auth/sign-in-with-base"
import { useMiniApp } from "@/components/providers/miniapp-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isMiniApp } = useMiniApp()

  const redirectTo = useMemo(() => {
    const raw = searchParams.get("redirect") || "/"
    // Prevent open redirects: only allow same-origin relative paths.
    if (!raw.startsWith("/")) return "/"
    return raw
  }, [searchParams])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setEmailLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      })

      if (result?.error) {
        setError("Invalid email or password.")
        return
      }

      router.push(redirectTo)
    } catch {
      setError("Sign-in failed. Please try again.")
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(99,102,241,0.14),_transparent_60%)]" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-60" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          <Link href="/" className="mx-auto flex w-fit items-center gap-3 group">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 via-accent/10 to-transparent ring-1 ring-border/60 shadow-glow-subtle">
              <span className="h-5 w-5 rounded-md bg-primary/80" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-semibold tracking-tight text-foreground group-hover:opacity-90 transition-opacity">
                BaseHealth
              </span>
              <span className="block mt-0.5 text-[11px] text-muted-foreground">Sign in</span>
            </span>
          </Link>

          <Card className="border-border/60 bg-card/35 backdrop-blur-md shadow-glow-subtle">
            <CardHeader>
              <CardTitle className="text-2xl">Continue</CardTitle>
              <CardDescription>
                {isMiniApp
                  ? "Sign in without leaving the Base app."
                  : "Sign in with your wallet. You can also continue with email on the web."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Action needed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <SignInWithBase
                  className="w-full h-11"
                  onAuthSuccess={() => router.push(redirectTo)}
                  onAuthError={(message) => setError(message)}
                />
                <p className="text-xs text-muted-foreground leading-5">
                  You can explore without signing in. Some actions require a wallet signature.
                </p>
              </div>

              {!isMiniApp && (
                <details className="rounded-2xl border border-border/60 bg-background/20 p-4">
                  <summary className="cursor-pointer select-none text-sm font-semibold text-foreground">
                    Sign in with email
                  </summary>
                  <form onSubmit={handleEmailSubmit} className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={emailLoading}>
                      {emailLoading ? "Signing in…" : "Sign in with email"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </details>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Back
              </Link>
              <Link href="/support" className="hover:text-foreground transition-colors">
                Need help?
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

