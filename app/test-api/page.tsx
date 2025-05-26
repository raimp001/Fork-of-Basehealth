"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestApiPage() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testApi = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/clinical-trials?query=lung%20cancer&pageSize=5")
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      <Button onClick={testApi} disabled={loading}>
        {loading ? "Testing..." : "Test Clinical Trials API"}
      </Button>
      <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-96">
        {result || "Click the button to test the API"}
      </pre>
    </div>
  )
} 