import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()

const PUBLIC_DIR = path.join(ROOT, 'public')
const SCREENSHOTS_DIR = path.join(PUBLIC_DIR, 'screenshots')

const LOGO_SVG_PATH = path.join(PUBLIC_DIR, 'basehealth-logo.svg')

async function readLogoSvg() {
  return fs.readFile(LOGO_SVG_PATH, 'utf8')
}

function svgDataUri(svg) {
  // Encode minimal set for safe data URI usage in SVG <image href="...">.
  const encoded = Buffer.from(svg, 'utf8').toString('base64')
  return `data:image/svg+xml;base64,${encoded}`
}

async function ensureDirs() {
  await fs.mkdir(PUBLIC_DIR, { recursive: true })
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true })
}

async function writeIconPng({ size, outFile }) {
  await sharp(LOGO_SVG_PATH, { density: 512 })
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(outFile)
}

async function writeOgImagePng({ outFile }) {
  const w = 1200
  const h = 630
  const logoSvg = await readLogoSvg()
  const logoUri = svgDataUri(logoSvg)

  const ogSvg = `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0B1220"/>
          <stop offset="100%" stop-color="#1E3A8A"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bg)"/>
      <circle cx="1040" cy="100" r="260" fill="#2563EB" opacity="0.14"/>
      <circle cx="1120" cy="520" r="220" fill="#60A5FA" opacity="0.10"/>

      <g filter="url(#shadow)">
        <rect x="86" y="156" width="320" height="320" rx="64" fill="#0B1220" opacity="0.25"/>
        <image href="${logoUri}" x="110" y="180" width="272" height="272"/>
      </g>

      <text x="470" y="280" fill="#FFFFFF" font-size="78" font-weight="800" font-family="ui-sans-serif, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial">
        BaseHealth
      </text>
      <text x="470" y="350" fill="#DBEAFE" font-size="34" font-weight="600" font-family="ui-sans-serif, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial">
        Healthcare, simplified
      </text>
      <text x="470" y="404" fill="#93C5FD" font-size="24" font-weight="500" font-family="ui-sans-serif, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial">
        Screenings · Verified providers · USDC on Base
      </text>
    </svg>
  `

  await sharp(Buffer.from(ogSvg), { density: 240 })
    // Render vector high-res then downsample to the exact required dimensions.
    .resize(w, h, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(outFile)
}

async function writeScreenshotPng({ title, subtitle, outFile, accent = '#2563EB' }) {
  const w = 1284
  const h = 2778
  const logoSvg = await readLogoSvg()
  const logoUri = svgDataUri(logoSvg)

  const screenshotSvg = `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0B1220"/>
          <stop offset="100%" stop-color="#0A0F1F"/>
        </linearGradient>
        <linearGradient id="chip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="#60A5FA"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.38"/>
        </filter>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bg)"/>

      <circle cx="${w - 160}" cy="240" r="320" fill="${accent}" opacity="0.16"/>
      <circle cx="${w - 60}" cy="560" r="260" fill="#60A5FA" opacity="0.10"/>

      <g filter="url(#shadow)">
        <rect x="92" y="176" width="${w - 184}" height="680" rx="72" fill="#0F172A" opacity="0.92"/>
        <rect x="130" y="214" width="100" height="100" rx="28" fill="url(#chip)"/>
        <image href="${logoUri}" x="145" y="229" width="70" height="70"/>

        <text x="260" y="292" fill="#E5E7EB" font-size="28" font-weight="700" font-family="ui-sans-serif, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial">
          BaseHealth
        </text>

        <text x="130" y="454" fill="#FFFFFF" font-size="76" font-weight="900" font-family="ui-sans-serif, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial">
          ${title}
        </text>
        <text x="130" y="528" fill="#93C5FD" font-size="34" font-weight="600" font-family="ui-sans-serif, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial">
          ${subtitle}
        </text>
      </g>

      <g opacity="0.85">
        <rect x="92" y="940" width="${w - 184}" height="720" rx="72" fill="#0B1220"/>
        <rect x="92" y="1724" width="${w - 184}" height="920" rx="72" fill="#0B1220"/>
        <rect x="132" y="980" width="${w - 264}" height="60" rx="20" fill="#111827"/>
        <rect x="132" y="1060" width="${w - 344}" height="60" rx="20" fill="#111827"/>
        <rect x="132" y="1140" width="${w - 304}" height="60" rx="20" fill="#111827"/>

        <rect x="132" y="1764" width="${w - 264}" height="340" rx="40" fill="#0F172A"/>
        <rect x="132" y="2124" width="${w - 264}" height="340" rx="40" fill="#0F172A"/>
        <rect x="132" y="2484" width="${w - 264}" height="120" rx="40" fill="${accent}" opacity="0.88"/>
      </g>

      <text x="92" y="${h - 110}" fill="#6B7280" font-size="26" font-weight="600" font-family="ui-sans-serif, -apple-system, system-ui, Segoe UI, Roboto, Helvetica, Arial">
        Pay with USDC on Base · Verified providers · Private by design
      </text>
    </svg>
  `

  await sharp(Buffer.from(screenshotSvg), { density: 240 })
    // Render vector high-res then downsample to the exact required dimensions.
    .resize(w, h, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(outFile)
}

async function main() {
  await ensureDirs()

  // Icons
  await writeIconPng({ size: 1024, outFile: path.join(PUBLIC_DIR, 'icon-1024.png') })
  await writeIconPng({ size: 512, outFile: path.join(PUBLIC_DIR, 'icon-512.png') })
  await writeIconPng({ size: 192, outFile: path.join(PUBLIC_DIR, 'icon-192.png') })
  await writeIconPng({ size: 512, outFile: path.join(PUBLIC_DIR, 'icon.png') })
  await writeIconPng({ size: 200, outFile: path.join(PUBLIC_DIR, 'splash.png') })

  // OG image
  await writeOgImagePng({ outFile: path.join(PUBLIC_DIR, 'og-image.png') })

  // Mini app screenshots
  await writeScreenshotPng({
    title: 'Screenings',
    subtitle: 'Personalized, evidence-based recommendations',
    outFile: path.join(SCREENSHOTS_DIR, 'screening.png'),
    accent: '#2563EB',
  })
  await writeScreenshotPng({
    title: 'Providers',
    subtitle: 'Verified clinicians with on-chain attestations',
    outFile: path.join(SCREENSHOTS_DIR, 'providers.png'),
    accent: '#16A34A',
  })
  await writeScreenshotPng({
    title: 'Payments',
    subtitle: 'Checkout with USDC on Base',
    outFile: path.join(SCREENSHOTS_DIR, 'payment.png'),
    accent: '#F59E0B',
  })

  // PWA screenshots referenced by manifest.json (avoid broken URLs).
  await sharp(path.join(PUBLIC_DIR, 'og-image.png'))
    .resize(1280, 720, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, 'screenshot-wide.png'))

  await sharp(path.join(PUBLIC_DIR, 'og-image.png'))
    .resize(750, 1334, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, 'screenshot-narrow.png'))

  // Shortcut icons referenced by manifest.json.
  const shortcutSvg = await readLogoSvg()
  const shortcutSrc = Buffer.from(shortcutSvg)
  await sharp(shortcutSrc, { density: 512 })
    .resize(96, 96, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, 'icon-screening.png'))
  await sharp(shortcutSrc, { density: 512 })
    .resize(96, 96, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, 'icon-search.png'))
  await sharp(shortcutSrc, { density: 512 })
    .resize(96, 96, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, 'icon-trials.png'))

  console.log('Generated mini app assets in public/.')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
