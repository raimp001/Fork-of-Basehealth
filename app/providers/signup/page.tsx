"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function ProviderSignupPage() {
  const [form, setForm] = useState({ name: '', email: '', specialty: '', credentials: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">Provider Sign Up</h1>
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input name="name" type="text" required value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter your full name" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input name="email" type="email" required value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter your email" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Specialty</label>
            <input name="specialty" type="text" required value={form.specialty} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. Family Medicine, Dentist" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Credentials</label>
            <input name="credentials" type="text" required value={form.credentials} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g. MD, DO, DDS" />
          </div>
          <Button type="submit" className="w-full">Sign Up</Button>
        </form>
      ) : (
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-4">Thank You!</h2>
          <p>Your application has been received. We will review your credentials and contact you soon.</p>
        </div>
      )}
    </div>
  )
} 