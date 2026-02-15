const DEFAULT_BASE_BUILDER_CODE = "bc_rj6pm82w"

// ERC-8021 marker used to detect/parse attribution suffixes.
// 0x8021 repeated to 16 bytes.
const ERC8021_MARKER_HEX = "80218021802180218021802180218021"

// Attribution schema id currently used by Base Builder Codes.
// See Base docs: "Builder Codes" and "ERC-8021".
const ERC8021_SCHEMA_ID_HEX = "00"

function bytesToHex(bytes: Uint8Array): string {
  let out = ""
  for (const b of bytes) out += b.toString(16).padStart(2, "0")
  return out
}

export function getBaseBuilderCode(): string {
  // NEXT_PUBLIC_* is available client-side; BASE_BUILDER_CODE is server-only override.
  return (
    (process.env.NEXT_PUBLIC_BASE_BUILDER_CODE ||
      process.env.BASE_BUILDER_CODE ||
      DEFAULT_BASE_BUILDER_CODE) ?? ""
  ).trim()
}

/**
 * Encode Base Builder Codes as an ERC-8021 attribution suffix.
 *
 * Format (for each code): [len:1 byte][utf8 bytes]
 * Followed by: [schemaId:1 byte][marker:16 bytes]
 *
 * Example from Base docs: ["baseapp"] =>
 * 0x07 62617365617070 00 8021...8021
 */
export function buildErc8021AttributionSuffix(codes: string[]): `0x${string}` | null {
  const normalized = codes.map((c) => c.trim()).filter(Boolean)
  if (normalized.length === 0) return null

  const encoder = new TextEncoder()
  let payload = ""

  for (const code of normalized) {
    const bytes = encoder.encode(code)
    if (bytes.length === 0) continue
    if (bytes.length > 255) {
      throw new Error("Builder code too long for ERC-8021 suffix")
    }
    payload += bytes.length.toString(16).padStart(2, "0")
    payload += bytesToHex(bytes)
  }

  if (!payload) return null
  return `0x${payload}${ERC8021_SCHEMA_ID_HEX}${ERC8021_MARKER_HEX}` as `0x${string}`
}

export function appendErc8021Suffix(data: string | null | undefined, suffix: string | null): string | undefined {
  if (!suffix) return data ?? undefined
  const base = data && data.startsWith("0x") ? data : "0x"
  return `${base}${suffix.slice(2)}`
}

export function appendBaseBuilderCode(data: string | null | undefined): string | undefined {
  const code = getBaseBuilderCode()
  if (!code) return data ?? undefined
  const suffix = buildErc8021AttributionSuffix([code])
  return appendErc8021Suffix(data, suffix)
}
