const PRIMARY_ADMIN_EMAIL = "basehealthapp@gmail.com"

function normalizeEmail(email?: string | null): string {
  return typeof email === "string" ? email.trim().toLowerCase() : ""
}

export function getPrimaryAdminEmail(): string {
  return PRIMARY_ADMIN_EMAIL
}

export function isAdminEmail(email?: string | null): boolean {
  return normalizeEmail(email) === PRIMARY_ADMIN_EMAIL
}

