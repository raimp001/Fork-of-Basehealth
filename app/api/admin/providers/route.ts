/**
 * Admin API - Get all providers for review
 * 
 * Flow: Verification → Approval → Attestation
 * 
 * 1. Provider submits application
 * 2. Verification pipeline runs (NPI, OIG, SAM, License)
 * 3. Admin reviews verification results
 * 4. Admin approves/rejects
 * 5. If approved + wallet configured → on-chain attestation created
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { attestProviderCredential, type ProviderCredentialData } from "@/lib/base-attestations"
import { canCreateAttestation, getVerificationSummary } from "@/lib/onboarding/verification-service"

export async function GET(req: NextRequest) {
  try {
    // Get query params for filtering
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // pending, verified, all
    const type = searchParams.get("type") // PHYSICIAN, APP

    // Build where clause
    const where: any = {}
    
    if (status === "pending") {
      where.isVerified = false
    } else if (status === "verified") {
      where.isVerified = true
    }
    
    if (type) {
      where.type = type
    }

    // Fetch providers from database
    const providers = await prisma.provider.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        type: true,
        fullName: true,
        organizationName: true,
        email: true,
        phone: true,
        npiNumber: true,
        licenseNumber: true,
        licenseState: true,
        specialties: true,
        bio: true,
        isVerified: true,
        acceptingPatients: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Get stats
    const stats = await prisma.provider.groupBy({
      by: ["isVerified"],
      _count: true
    })

    const totalProviders = providers.length
    const pendingCount = stats.find(s => s.isVerified === false)?._count || 0
    const verifiedCount = stats.find(s => s.isVerified === true)?._count || 0

    return NextResponse.json({
      success: true,
      providers,
      stats: {
        total: totalProviders,
        pending: pendingCount,
        verified: verifiedCount
      }
    })
  } catch (error) {
    logger.error("Error fetching providers for admin", error)
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { providerId, action, notes } = await req.json()

    if (!providerId || !action) {
      return NextResponse.json(
        { error: "Provider ID and action are required" },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case "approve":
        updateData.isVerified = true
        updateData.status = "APPROVED"
        break
      case "reject":
        updateData.isVerified = false
        updateData.status = "REJECTED"
        break
      case "toggle_accepting":
        const providerForToggle = await prisma.provider.findUnique({
          where: { id: providerId }
        })
        updateData.acceptingPatients = !providerForToggle?.acceptingPatients
        break
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

    const updatedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: updateData
    })

    // If approved, check verification status and create attestation if eligible
    let attestationResult = null
    let verificationStatus = null
    
    if (action === "approve") {
      // Check if attestation is allowed (all verifications passed)
      const attestationCheck = await canCreateAttestation(providerId)
      
      if (attestationCheck.allowed && updatedProvider.walletAddress) {
        // All verifications passed - create on-chain attestation
        const credentialData: ProviderCredentialData = {
          npiNumber: updatedProvider.npiNumber || '',
          licenseNumber: updatedProvider.licenseNumber || '',
          licenseState: updatedProvider.licenseState || '',
          providerType: updatedProvider.type,
          specialty: updatedProvider.specialties?.[0] || '',
          npiVerified: true,
          licenseVerified: true,
        }
        
        attestationResult = await attestProviderCredential(
          updatedProvider.walletAddress,
          credentialData
        )
        
        if (attestationResult.success) {
          logger.info("Provider credential attestation created on approval", {
            providerId,
            attestationUid: attestationResult.uid,
          })
          
          // Update provider with attestation UID in OIG check field as marker
          await prisma.provider.update({
            where: { id: providerId },
            data: {
              oigClear: true,
              samClear: true,
              lastOigCheck: new Date(),
              lastSamCheck: new Date(),
            },
          })
        }
      } else if (!attestationCheck.allowed) {
        // Log why attestation was not created
        logger.warn("Attestation not created - verification check failed", {
          providerId,
          reason: attestationCheck.reason,
        })
        verificationStatus = {
          attestationBlocked: true,
          reason: attestationCheck.reason,
        }
      } else if (!updatedProvider.walletAddress) {
        logger.info("Attestation not created - no wallet address", { providerId })
        verificationStatus = {
          attestationBlocked: false,
          reason: "No wallet address configured - attestation can be created later",
        }
      }
    }

    logger.info("Provider updated by admin", {
      providerId,
      action,
      isVerified: updatedProvider.isVerified,
      hasAttestation: !!attestationResult?.success,
    })

    return NextResponse.json({
      success: true,
      provider: updatedProvider,
      attestation: attestationResult?.success ? {
        uid: attestationResult.uid,
        txHash: attestationResult.txHash,
        explorerUrl: attestationResult.explorerUrl,
      } : null,
      verification: verificationStatus,
      message: action === "approve" 
        ? "Provider approved successfully" + (attestationResult?.success ? " with on-chain attestation" : "")
        : action === "reject"
        ? "Provider rejected"
        : "Provider updated"
    })
  } catch (error) {
    logger.error("Error updating provider", error)
    return NextResponse.json(
      { error: "Failed to update provider" },
      { status: 500 }
    )
  }
}
