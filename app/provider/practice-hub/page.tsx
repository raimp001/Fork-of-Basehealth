"use client"

import { useEffect, useState } from "react"
import { MinimalNavigation } from "@/components/layout/minimal-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Snapshot = {
  partners: Array<{ id: string; name: string; type: "pharmacy" | "lab" | "imaging"; address: string; phone: string }>
  priorAuth: Array<{ id: string; medicationOrService: string; status: string; payer: string }>
  receipts: Array<{ id: string; amountUsd: number; status: string; description: string }>
  updates: Array<{ id: string; title: string; summary: string; audience: "patient" | "provider" }>
  openCloud: { enabled: boolean; version: string; capabilities: string[] }
}

export default function PracticeHubPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [actionMessage, setActionMessage] = useState("")

  useEffect(() => {
    fetch("/api/care-orchestration?patientId=practice-demo")
      .then((res) => res.json())
      .then((data) => setSnapshot(data))
  }, [])

  const runAction = async (type: string) => {
    const res = await fetch("/api/care-orchestration/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, payload: { initiatedBy: "provider" } }),
    })

    if (res.ok) setActionMessage(`Action completed: ${type}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalNavigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl pt-24 space-y-6">
        <h1 className="text-3xl font-bold">Primary Care Practice Hub</h1>

        <Card>
          <CardHeader>
            <CardTitle>OpenCloud Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Status: {snapshot?.openCloud?.enabled ? "Enabled" : "Disabled"} ({snapshot?.openCloud?.version})</p>
            <p className="text-sm mt-2">Capabilities: {(snapshot?.openCloud?.capabilities || []).join(", ")}</p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Pharmacy / Labs / Imaging</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(snapshot?.partners || []).map((partner) => (
                <div key={partner.id} className="text-sm border rounded p-2">
                  <p className="font-medium">{partner.name} ({partner.type})</p>
                  <p className="text-muted-foreground">{partner.address} • {partner.phone}</p>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => runAction("send-pharmacy-order")}>Send Rx</Button>
                <Button size="sm" variant="outline" onClick={() => runAction("create-lab-order")}>Order Labs</Button>
                <Button size="sm" variant="outline" onClick={() => runAction("create-imaging-order")}>Order Imaging</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Billing + Prior Authorization</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(snapshot?.priorAuth || []).map((item) => (
                <p key={item.id} className="text-sm">{item.medicationOrService} - {item.status} ({item.payer})</p>
              ))}
              {(snapshot?.receipts || []).map((r) => (
                <p key={r.id} className="text-sm">Receipt: ${r.amountUsd} • {r.status} • {r.description}</p>
              ))}
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => runAction("submit-prior-auth")}>Submit Prior Auth</Button>
                <Button size="sm" variant="outline" onClick={() => runAction("issue-receipt")}>Issue Receipt</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Updates and Articles</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(snapshot?.updates || []).map((update) => (
              <div key={update.id} className="text-sm border rounded p-2">
                <p className="font-medium">{update.title}</p>
                <p className="text-muted-foreground">{update.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {actionMessage && <p className="text-sm text-green-600">{actionMessage}</p>}
      </div>
    </div>
  )
}
