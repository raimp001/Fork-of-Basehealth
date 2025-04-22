"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"

export function MinimalScreeningReminders() {
  const screenings = [
    {
      id: "1",
      name: "Annual Physical",
      status: "due",
      dueDate: "Overdue by 2 months",
      provider: "Dr. Sarah Johnson",
      importance: "essential",
    },
    {
      id: "2",
      name: "Blood Pressure Check",
      status: "upcoming",
      dueDate: "Due in 2 weeks",
      provider: null,
      importance: "recommended",
    },
    {
      id: "3",
      name: "Cholesterol Screening",
      status: "completed",
      completedDate: "3 months ago",
      nextDue: "9 months",
      provider: "Dr. Michael Chen",
      importance: "routine",
    },
  ]

  const healthScore = 72

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "due":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "upcoming":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "essential":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Essential</Badge>
      case "recommended":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Recommended</Badge>
      case "routine":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Routine</Badge>
      default:
        return null
    }
  }

  return (
    <div className="container px-4 py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Health Screenings</h1>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Health Score</CardTitle>
          <CardDescription>Based on your screening completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Your score</span>
              <span className="text-sm font-medium">{healthScore}/100</span>
            </div>
            <Progress value={healthScore} className="h-2" />
            <p className="text-xs text-muted-foreground">Complete your due screenings to improve your health score</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {screenings.map((screening) => (
          <Card key={screening.id} className={screening.status === "due" ? "border-red-200" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="mt-0.5">{getStatusIcon(screening.status)}</div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{screening.name}</h3>
                    {getImportanceBadge(screening.importance)}
                  </div>

                  {screening.status === "due" && <p className="text-sm text-red-600">{screening.dueDate}</p>}

                  {screening.status === "upcoming" && <p className="text-sm text-yellow-600">{screening.dueDate}</p>}

                  {screening.status === "completed" && (
                    <p className="text-sm text-green-600">Completed {screening.completedDate}</p>
                  )}

                  {screening.provider && (
                    <p className="text-sm text-muted-foreground">Provider: {screening.provider}</p>
                  )}
                </div>
              </div>

              {screening.status !== "completed" && (
                <div className="mt-4">
                  <Button size="sm" className="w-full">
                    {screening.provider ? "Schedule Appointment" : "Find Provider"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Button variant="outline" className="w-full">
          <Calendar className="mr-2 h-4 w-4" />
          View All Recommended Screenings
        </Button>
      </div>
    </div>
  )
}
