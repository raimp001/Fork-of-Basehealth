import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8">Sorry, the page you are looking for does not exist.</p>
      <div className="flex gap-4">
        <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Go Home
        </Link>
        <Link href="/chat" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
          Get Help
        </Link>
      </div>
    </div>
  )
}
