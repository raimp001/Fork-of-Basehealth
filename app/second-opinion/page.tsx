"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function SecondOpinionPage() {
  const [form, setForm] = useState({ description: '', bounty: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">Second Opinion</h1>
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
          <div>
            <label className="block mb-1 font-medium">Case Description</label>
            <textarea name="description" required value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2 min-h-[100px]" placeholder="Describe your case or question" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Bounty (USD or Crypto)</label>
            <input name="bounty" type="number" min="0" required value={form.bounty} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter bounty amount" />
          </div>
          <Button type="submit" className="w-full">Post Case</Button>
        </form>
      ) : (
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-4">Case Posted!</h2>
          <p className="mb-4">Your case is now live for providers to review and respond.</p>
          <div className="mt-6 text-left">
            <h3 className="font-medium mb-2">Provider Responses (coming soon)</h3>
            <div className="text-muted-foreground">No responses yet.</div>
          </div>
        </div>
      )}
    </div>
  )
} 