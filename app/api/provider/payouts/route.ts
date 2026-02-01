/**
 * Provider Payouts API
 * 
 * Handles USDC payouts to provider wallets on Base.
 * 
 * GET /api/provider/payouts - Get payout history for a provider
 * POST /api/provider/payouts - Request a payout
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processProviderPayout, settlementConfig } from '@/lib/usdc-settlement-service'
import { logger } from '@/lib/logger'

/**
 * GET - Retrieve payout history for a provider
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')
    
    if (!providerId) {
      return NextResponse.json({
        success: false,
        error: 'Provider ID is required',
      }, { status: 400 })
    }
    
    // Get provider with their payouts
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        fullName: true,
        email: true,
        walletAddress: true,
        payoutPreference: true,
        pendingPayoutUsdc: true,
        totalEarnedUsdc: true,
        lastPayoutAt: true,
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })
    
    if (!provider) {
      return NextResponse.json({
        success: false,
        error: 'Provider not found',
      }, { status: 404 })
    }
    
    // Format amounts for display
    const pendingUsdc = provider.pendingPayoutUsdc 
      ? (parseInt(provider.pendingPayoutUsdc) / 1_000_000).toFixed(2)
      : '0.00'
    
    const totalEarned = provider.totalEarnedUsdc
      ? (parseInt(provider.totalEarnedUsdc) / 1_000_000).toFixed(2)
      : '0.00'
    
    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        name: provider.fullName,
        email: provider.email,
        walletAddress: provider.walletAddress,
        payoutPreference: provider.payoutPreference,
      },
      balance: {
        pending: pendingUsdc,
        pendingRaw: provider.pendingPayoutUsdc || '0',
        totalEarned: totalEarned,
        totalEarnedRaw: provider.totalEarnedUsdc || '0',
        currency: 'USDC',
        chain: 'Base',
      },
      payouts: provider.payouts.map(p => ({
        id: p.id,
        amount: (parseInt(p.amountUsdc) / 1_000_000).toFixed(2),
        amountRaw: p.amountUsdc,
        status: p.status,
        txHash: p.txHash,
        walletAddress: p.walletAddress,
        createdAt: p.createdAt,
        processedAt: p.processedAt,
      })),
      lastPayoutAt: provider.lastPayoutAt,
      minPayoutThreshold: settlementConfig.minPayoutThreshold,
    })
    
  } catch (error) {
    logger.error('Error fetching provider payouts', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch payout history',
    }, { status: 500 })
  }
}

/**
 * POST - Request a payout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId } = body
    
    if (!providerId) {
      return NextResponse.json({
        success: false,
        error: 'Provider ID is required',
      }, { status: 400 })
    }
    
    // Get provider
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    })
    
    if (!provider) {
      return NextResponse.json({
        success: false,
        error: 'Provider not found',
      }, { status: 404 })
    }
    
    if (!provider.walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'No wallet address configured. Please add a wallet address in settings.',
      }, { status: 400 })
    }
    
    const pendingAmount = provider.pendingPayoutUsdc 
      ? parseInt(provider.pendingPayoutUsdc) 
      : 0
    
    // Check minimum threshold
    const minThresholdRaw = settlementConfig.minPayoutThreshold * 1_000_000
    if (pendingAmount < minThresholdRaw) {
      return NextResponse.json({
        success: false,
        error: `Minimum payout is $${settlementConfig.minPayoutThreshold} USDC. Current balance: $${(pendingAmount / 1_000_000).toFixed(2)}`,
      }, { status: 400 })
    }
    
    // Create payout record
    const payout = await prisma.providerPayout.create({
      data: {
        providerId: provider.id,
        amountUsdc: pendingAmount.toString(),
        walletAddress: provider.walletAddress,
        status: 'PROCESSING',
        paymentIds: [],
      },
    })
    
    // Process the payout (transfer USDC)
    const result = await processProviderPayout(
      provider.id,
      provider.walletAddress,
      pendingAmount.toString(),
      []
    )
    
    // Update payout and provider
    if (result.status === 'completed') {
      await prisma.$transaction([
        prisma.providerPayout.update({
          where: { id: payout.id },
          data: {
            status: 'COMPLETED',
            txHash: result.txHash,
            processedAt: new Date(),
          },
        }),
        prisma.provider.update({
          where: { id: provider.id },
          data: {
            pendingPayoutUsdc: '0',
            totalEarnedUsdc: (
              (parseInt(provider.totalEarnedUsdc || '0') + pendingAmount)
            ).toString(),
            lastPayoutAt: new Date(),
          },
        }),
      ])
      
      return NextResponse.json({
        success: true,
        payout: {
          id: payout.id,
          amount: (pendingAmount / 1_000_000).toFixed(2),
          txHash: result.txHash,
          status: 'completed',
          explorerUrl: `https://${process.env.NODE_ENV === 'production' ? '' : 'sepolia.'}basescan.org/tx/${result.txHash}`,
        },
      })
    } else {
      // Mark as failed
      await prisma.providerPayout.update({
        where: { id: payout.id },
        data: {
          status: 'FAILED',
        },
      })
      
      return NextResponse.json({
        success: false,
        error: 'Payout processing failed. Please try again.',
      }, { status: 500 })
    }
    
  } catch (error) {
    logger.error('Error processing provider payout', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process payout',
    }, { status: 500 })
  }
}

/**
 * PATCH - Update wallet address
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId, walletAddress, payoutPreference } = body
    
    if (!providerId) {
      return NextResponse.json({
        success: false,
        error: 'Provider ID is required',
      }, { status: 400 })
    }
    
    // Validate wallet address format if provided
    if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid wallet address format. Must be a valid Ethereum address (0x...)',
      }, { status: 400 })
    }
    
    // Update provider
    const updatedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        ...(walletAddress !== undefined && { walletAddress }),
        ...(payoutPreference && { payoutPreference }),
      },
      select: {
        id: true,
        walletAddress: true,
        payoutPreference: true,
      },
    })
    
    return NextResponse.json({
      success: true,
      provider: updatedProvider,
    })
    
  } catch (error) {
    logger.error('Error updating provider payment settings', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update payment settings',
    }, { status: 500 })
  }
}
