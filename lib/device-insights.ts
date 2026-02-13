export type SupportedDevice = {
  id: string
  name: string
  category: "activity" | "heart" | "sleep"
}

export type DeviceMetrics = {
  steps?: number
  restingHeartRate?: number
  sleepHours?: number
}

export type PersonalizedInsight = {
  id: string
  title: string
  recommendation: string
  severity: "info" | "attention"
}

export const SUPPORTED_DEVICES: SupportedDevice[] = [
  { id: "apple-health", name: "Apple Health", category: "activity" },
  { id: "fitbit", name: "Fitbit", category: "activity" },
  { id: "oura", name: "Oura Ring", category: "sleep" },
  { id: "garmin", name: "Garmin", category: "heart" },
]

export function generatePersonalizedInsights(metrics: DeviceMetrics): PersonalizedInsight[] {
  const insights: PersonalizedInsight[] = []

  if (typeof metrics.steps === "number") {
    if (metrics.steps < 7000) {
      insights.push({
        id: "activity",
        title: "Increase daily activity",
        recommendation:
          "Your step trend is below 7,000/day. Consider a 20-minute walk after meals and review with your care team if fatigue limits movement.",
        severity: "attention",
      })
    } else {
      insights.push({
        id: "activity-good",
        title: "Keep your movement routine",
        recommendation: "Great job staying active. Maintain your current step routine and hydrate consistently.",
        severity: "info",
      })
    }
  }

  if (typeof metrics.restingHeartRate === "number" && metrics.restingHeartRate > 85) {
    insights.push({
      id: "heart-rate",
      title: "Review elevated resting heart rate",
      recommendation:
        "Your resting heart rate has trended high. Focus on sleep quality, hydration, and discuss persistent elevations with your provider.",
      severity: "attention",
    })
  }

  if (typeof metrics.sleepHours === "number") {
    if (metrics.sleepHours < 7) {
      insights.push({
        id: "sleep",
        title: "Prioritize sleep recovery",
        recommendation:
          "You are averaging under 7 hours of sleep. Aim for a consistent bedtime and reduce screen exposure 60 minutes before sleep.",
        severity: "attention",
      })
    } else {
      insights.push({
        id: "sleep-good",
        title: "Sleep target met",
        recommendation: "Your sleep duration is in a healthy range. Keep your current nighttime routine.",
        severity: "info",
      })
    }
  }

  if (insights.length === 0) {
    insights.push({
      id: "fallback",
      title: "Connect a device to personalize recommendations",
      recommendation: "After syncing activity, heart rate, and sleep data, we can suggest tailored next steps.",
      severity: "info",
    })
  }

  return insights
}
