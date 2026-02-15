import Link from "next/link"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

export default async function AdminFeedbackPage() {
  const session = await getServerSession()
  const role = (session?.user as any)?.role as string | undefined

  if (role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Card>
            <CardHeader>
              <CardTitle>Admin only</CardTitle>
              <CardDescription>You must be signed in as an admin to view feedback.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login" className="text-blue-700 hover:underline">
                Go to login
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const feedback = await prisma.auditLog.findMany({
    where: { action: "feedback.submitted" },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  const stats = feedback.reduce(
    (acc, item) => {
      const metadata = (item.metadata || {}) as any
      const category = asString(metadata.category) || "other"
      const rating = asNumber(metadata.rating)
      acc.total += 1
      acc.byCategory[category] = (acc.byCategory[category] || 0) + 1
      if (rating) {
        acc.ratingCount += 1
        acc.ratingSum += rating
      }
      return acc
    },
    {
      total: 0,
      byCategory: {} as Record<string, number>,
      ratingSum: 0,
      ratingCount: 0,
    },
  )

  const avgRating = stats.ratingCount ? stats.ratingSum / stats.ratingCount : null
  const categories = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-stone-900">Feedback Inbox</h1>
          <p className="text-stone-600 mt-2">
            Aggregated user feedback. Prioritize items that show repeated patterns (consensus).
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline">Total: {stats.total}</Badge>
            <Badge variant="outline">
              Avg rating: {avgRating ? avgRating.toFixed(2) : "—"}
            </Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map(([category, count]) => (
              <Badge key={category} variant="secondary">
                {category}: {count}
              </Badge>
            ))}
          </div>
        </section>

        <section className="grid gap-3">
          {feedback.map((item) => {
            const metadata = (item.metadata || {}) as any
            const category = asString(metadata.category) || "other"
            const rating = asNumber(metadata.rating)
            const page = asString(metadata.page)
            const desc = item.description || ""

            return (
              <Card key={item.id} className="border-stone-200">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{category}</Badge>
                    {rating ? <Badge variant="outline">rating {rating}/5</Badge> : null}
                    {page ? <Badge variant="outline">{page}</Badge> : null}
                    <span className="text-xs text-stone-500 ml-auto">{item.createdAt.toISOString()}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-stone-900">{desc}</p>
                  {(item.actorEmail || item.actorRole) && (
                    <p className="text-xs text-stone-500 mt-3">
                      Actor: {item.actorEmail || "unknown"} {item.actorRole ? `(${item.actorRole})` : ""}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {feedback.length === 0 && (
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle>No feedback yet</CardTitle>
                <CardDescription>Once users submit feedback, it will appear here.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}

