"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ExternalLink } from "lucide-react"
import { useCachedData } from "@/hooks/use-cached-data"
import { getAppointmentsByPatientId } from "@/services/appointment-service"

interface BlockchainPaymentHistoryProps {
  patientId: string
}

export function BlockchainPaymentHistory({ patientId }: BlockchainPaymentHistoryProps) {
  const {
    data: appointmentsData,
    isLoading,
    error,
    refetch,
  } = useCachedData(`patient-appointments-${patientId}`, () => getAppointmentsByPatientId(patientId, 1, 10), {
    ttl: 5 * 60 * 1000, // 5 minutes
  })

  const blockchainPayments = appointmentsData?.appointments.filter(
    (appointment) => appointment.payment_method === "blockchain" && appointment.blockchain_tx_hash,
  )

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  const getExplorerUrl = (txHash: string) => {
    // Using Base Sepolia testnet by default
    return `https://sepolia.basescan.org/tx/${txHash}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Payments</CardTitle>
          <CardDescription>Your recent payments on Base</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Payments</CardTitle>
          <CardDescription>Your recent payments on Base</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500">Failed to load payment history</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blockchain Payments</CardTitle>
        <CardDescription>Your recent payments on Base</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {blockchainPayments && blockchainPayments.length > 0 ? (
            blockchainPayments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-medium">Payment for {new Date(payment.date).toLocaleDateString()} appointment</p>
                  <div className="flex items-center text-xs text-gray-500 space-x-1">
                    <span className="truncate max-w-[120px]">{payment.blockchain_tx_hash}</span>
                    <a
                      href={getExplorerUrl(payment.blockchain_tx_hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                <div className="flex items-center text-green-600">
                  <ArrowUpRight size={14} className="mr-1" />
                  <span>{formatAmount(payment.payment_amount)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No blockchain payments found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
