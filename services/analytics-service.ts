import { ethers } from "ethers"
import { getBlockchainService } from "./blockchain-service"

export interface ClaimAnalytics {
  totalClaims: number
  totalAmount: string
  approvedClaims: number
  rejectedClaims: number
  pendingClaims: number
  averageProcessingTime: number
  claimsByMonth: {
    month: string
    count: number
    amount: string
  }[]
  statusDistribution: {
    status: string
    count: number
    percentage: number
  }[]
}

export interface ProviderAnalytics {
  totalProcessed: number
  approvalRate: number
  averageResponseTime: number
  claimsByStatus: {
    status: string
    count: number
  }[]
  monthlyActivity: {
    month: string
    processed: number
    approved: number
    rejected: number
  }[]
}

export async function getPatientAnalytics(address: string): Promise<ClaimAnalytics> {
  const blockchainService = getBlockchainService()
  const claimIds = await blockchainService.getPatientClaims(address)
  
  const claims = await Promise.all(
    claimIds.map(async (claimId) => {
      const details = await blockchainService.getClaimDetails(claimId)
      return {
        claimId,
        amount: details.amount,
        status: details.status,
        timestamp: details.timestamp,
      }
    })
  )

  // Calculate analytics
  const totalClaims = claims.length
  const totalAmount = claims.reduce((sum, claim) => sum + BigInt(claim.amount), BigInt(0))
  const approvedClaims = claims.filter(claim => claim.status === 1).length
  const rejectedClaims = claims.filter(claim => claim.status === 2).length
  const pendingClaims = claims.filter(claim => claim.status === 0).length

  // Calculate average processing time for completed claims
  const completedClaims = claims.filter(claim => claim.status !== 0)
  const averageProcessingTime = completedClaims.length > 0
    ? completedClaims.reduce((sum, claim) => {
        const processingTime = Math.floor(Date.now() / 1000) - Number(claim.timestamp)
        return sum + processingTime
      }, 0) / completedClaims.length
    : 0

  // Group claims by month
  const claimsByMonth = claims.reduce((acc, claim) => {
    const date = new Date(Number(claim.timestamp) * 1000)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    const existingMonth = acc.find(m => m.month === month)
    if (existingMonth) {
      existingMonth.count++
      existingMonth.amount = ethers.formatEther(
        BigInt(existingMonth.amount) + BigInt(claim.amount)
      )
    } else {
      acc.push({
        month,
        count: 1,
        amount: ethers.formatEther(claim.amount),
      })
    }
    return acc
  }, [] as { month: string; count: number; amount: string }[])

  // Calculate status distribution
  const statusDistribution = [
    { status: "Pending", count: pendingClaims, percentage: (pendingClaims / totalClaims) * 100 },
    { status: "Approved", count: approvedClaims, percentage: (approvedClaims / totalClaims) * 100 },
    { status: "Rejected", count: rejectedClaims, percentage: (rejectedClaims / totalClaims) * 100 },
  ]

  return {
    totalClaims,
    totalAmount: ethers.formatEther(totalAmount),
    approvedClaims,
    rejectedClaims,
    pendingClaims,
    averageProcessingTime,
    claimsByMonth,
    statusDistribution,
  }
}

export async function getProviderAnalytics(providerAddress: string): Promise<ProviderAnalytics> {
  const blockchainService = getBlockchainService()
  
  // Get all claims processed by this provider
  const processedClaims = await blockchainService.getProviderClaims(providerAddress)
  
  // Calculate total processed claims
  const totalProcessed = processedClaims.length
  
  // Calculate approval rate
  const approvedClaims = processedClaims.filter(claim => claim.status === 1).length
  const approvalRate = (approvedClaims / totalProcessed) * 100
  
  // Calculate average response time
  const averageResponseTime = processedClaims.reduce((sum, claim) => {
    const responseTime = Math.floor(Date.now() / 1000) - Number(claim.timestamp)
    return sum + responseTime
  }, 0) / totalProcessed
  
  // Group claims by status
  const claimsByStatus = [
    { status: "Approved", count: approvedClaims },
    { status: "Rejected", count: processedClaims.filter(claim => claim.status === 2).length },
    { status: "Pending", count: processedClaims.filter(claim => claim.status === 0).length },
  ]
  
  // Group claims by month
  const monthlyActivity = processedClaims.reduce((acc, claim) => {
    const date = new Date(Number(claim.timestamp) * 1000)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    const existingMonth = acc.find(m => m.month === month)
    if (existingMonth) {
      existingMonth.processed++
      if (claim.status === 1) existingMonth.approved++
      if (claim.status === 2) existingMonth.rejected++
    } else {
      acc.push({
        month,
        processed: 1,
        approved: claim.status === 1 ? 1 : 0,
        rejected: claim.status === 2 ? 1 : 0,
      })
    }
    return acc
  }, [] as { month: string; processed: number; approved: number; rejected: number }[])
  
  return {
    totalProcessed,
    approvalRate,
    averageResponseTime,
    claimsByStatus,
    monthlyActivity,
  }
} 