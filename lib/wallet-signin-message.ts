export const WALLET_NONCE_COOKIE_NAME = "bh_wallet_nonce"
export const WALLET_SIGNIN_MESSAGE_VERSION = 1

export type WalletSignInPayload = {
  domain: string
  uri: string
  address: string
  chainId: number
  nonce: string
  issuedAt: string
  version?: number
  statement?: string
}

export function buildWalletSignInMessage(payload: WalletSignInPayload): string {
  const version = payload.version ?? WALLET_SIGNIN_MESSAGE_VERSION
  const statement = payload.statement?.trim()
  const statementBlock = statement ? `${statement}\n\n` : ""

  return [
    "BaseHealth wants you to sign in with your wallet.",
    "",
    statementBlock ? statementBlock.trimEnd() : null,
    `Domain: ${payload.domain}`,
    `URI: ${payload.uri}`,
    `Version: ${version}`,
    `Chain ID: ${payload.chainId}`,
    `Nonce: ${payload.nonce}`,
    `Issued At: ${payload.issuedAt}`,
    `Address: ${payload.address}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n")
}

export function parseWalletSignInMessage(message: string): WalletSignInPayload | null {
  const getField = (label: string) => {
    const regex = new RegExp(`^${label}:\\s*(.+)$`, "m")
    const match = message.match(regex)
    return match?.[1]?.trim() || null
  }

  const domain = getField("Domain")
  const uri = getField("URI")
  const address = getField("Address")
  const chainIdRaw = getField("Chain ID")
  const nonce = getField("Nonce")
  const issuedAt = getField("Issued At")
  const versionRaw = getField("Version")

  if (!domain || !uri || !address || !chainIdRaw || !nonce || !issuedAt) return null

  const chainId = Number.parseInt(chainIdRaw, 10)
  if (!Number.isFinite(chainId)) return null

  const version = versionRaw ? Number.parseInt(versionRaw, 10) : WALLET_SIGNIN_MESSAGE_VERSION

  return {
    domain,
    uri,
    address,
    chainId,
    nonce,
    issuedAt,
    version: Number.isFinite(version) ? version : WALLET_SIGNIN_MESSAGE_VERSION,
  }
}

export function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null

  const parts = cookieHeader.split(";")
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue
    if (!trimmed.startsWith(`${name}=`)) continue
    const value = trimmed.slice(name.length + 1)
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  return null
}

export function isRecentIsoDate(isoString: string, maxAgeMs: number): boolean {
  const parsed = Date.parse(isoString)
  if (!Number.isFinite(parsed)) return false
  return Math.abs(Date.now() - parsed) <= maxAgeMs
}

