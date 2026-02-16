import { logger } from "@/lib/logger"
import { getPrimaryAdminEmail } from "@/lib/admin-access"

type ApplicationRole = "PROVIDER" | "CAREGIVER"

export type AdminApplicationNotification = {
  applicationId: string
  role: ApplicationRole
  applicantName: string
  applicantEmail: string
  specialty?: string | null
  source?: string
}

function getReviewPath(role: ApplicationRole): string {
  return role === "PROVIDER" ? "/admin/provider-applications" : "/admin/caregiver-applications"
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export async function notifyAdminApplicationSubmitted(data: AdminApplicationNotification): Promise<void> {
  const adminEmail = getPrimaryAdminEmail()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.basehealth.xyz"
  const reviewUrl = `${appUrl}${getReviewPath(data.role)}`

  logger.info("Application submitted for admin review", {
    applicationId: data.applicationId,
    role: data.role,
    applicantEmail: data.applicantEmail,
    source: data.source || "unknown",
    adminEmail,
  })

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    logger.info("Admin email not sent (RESEND_API_KEY missing)", {
      applicationId: data.applicationId,
      adminEmail,
    })
    return
  }

  const safeName = escapeHtml(data.applicantName || "Unknown")
  const safeEmail = escapeHtml(data.applicantEmail || "unknown")
  const safeRole = escapeHtml(data.role)
  const safeApplicationId = escapeHtml(data.applicationId)
  const safeSpecialty = escapeHtml((data.specialty || "").trim())
  const safeSource = escapeHtml(data.source || "unknown")

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
      <h2 style="margin: 0 0 12px;">New ${safeRole} Application</h2>
      <p style="margin: 0 0 16px; color: #475569;">A new application was submitted and is waiting for review.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr><td style="padding: 6px 0; color: #64748b;">Applicant</td><td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${safeName}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0; color: #0f172a;">${safeEmail}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Role</td><td style="padding: 6px 0; color: #0f172a;">${safeRole}</td></tr>
        ${safeSpecialty ? `<tr><td style="padding: 6px 0; color: #64748b;">Specialty</td><td style="padding: 6px 0; color: #0f172a;">${safeSpecialty}</td></tr>` : ""}
        <tr><td style="padding: 6px 0; color: #64748b;">Application ID</td><td style="padding: 6px 0; color: #0f172a; font-family: monospace;">${safeApplicationId}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Source</td><td style="padding: 6px 0; color: #0f172a;">${safeSource}</td></tr>
      </table>
      <a href="${reviewUrl}" style="display:inline-block; background:#0f172a; color:#fff; text-decoration:none; padding:10px 16px; border-radius:8px; font-weight:600;">
        Open review queue
      </a>
    </div>
  `

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BaseHealth <notifications@basehealth.xyz>",
        to: adminEmail,
        subject: `[BaseHealth] New ${data.role} application: ${data.applicantName || "Unknown"}`,
        html,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "")
      logger.warn("Failed to send admin application email", {
        applicationId: data.applicationId,
        status: response.status,
        errorBody,
      })
      return
    }

    logger.info("Admin application email sent", {
      applicationId: data.applicationId,
      adminEmail,
    })
  } catch (error) {
    logger.error("Admin notification email error", {
      applicationId: data.applicationId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

