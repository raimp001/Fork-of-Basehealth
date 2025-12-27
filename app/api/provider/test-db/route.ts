/**
 * Database Connection Test Endpoint
 * 
 * Use this to verify database connectivity without attempting registration
 * Visit: /api/provider/test-db
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET(req: NextRequest) {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    databaseUrlSet: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    nextauthSecretSet: !!process.env.NEXTAUTH_SECRET,
  }

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      success: false,
      error: "❌ DATABASE_URL is NOT SET",
      diagnostics,
      fix: {
        step1: "Go to Vercel Dashboard (https://vercel.com/dashboard)",
        step2: "Select your project → Settings → Environment Variables",
        step3: "Click 'Add New' and add: DATABASE_URL",
        step4: "Value format: postgresql://user:password@host:port/database",
        step5: "Select all environments (Production, Preview, Development)",
        step6: "Save and redeploy your application",
      },
    }, { status: 500 })
  }

  try {
    // Test database connection
    await prisma.$connect()
    
    // Try a simple query
    const providerCount = await prisma.provider.count()
    
    // Check if Prisma client is working
    await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({
      success: true,
      message: "✅ Database connection successful!",
      providerCount,
      diagnostics,
      nextStep: "Database is working. If signup still fails, check browser console for the exact error message.",
    })
  } catch (error) {
    logger.error('Database test failed', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // Parse common Prisma errors
    let errorType = "UNKNOWN"
    let fixSuggestion = ""
    
    if (errorMessage.includes("P1001") || errorMessage.includes("Can't reach database")) {
      errorType = "CONNECTION_REFUSED"
      fixSuggestion = "Database server is not reachable. Check if the host and port are correct."
    } else if (errorMessage.includes("P1002") || errorMessage.includes("timed out")) {
      errorType = "CONNECTION_TIMEOUT"
      fixSuggestion = "Connection timed out. Database server might be down or blocked by firewall."
    } else if (errorMessage.includes("P1003") || errorMessage.includes("does not exist")) {
      errorType = "DATABASE_NOT_FOUND"
      fixSuggestion = "Database does not exist. Create it first or check the database name."
    } else if (errorMessage.includes("authentication") || errorMessage.includes("password")) {
      errorType = "AUTHENTICATION_FAILED"
      fixSuggestion = "Wrong username or password in DATABASE_URL."
    } else if (errorMessage.includes("ENOTFOUND") || errorMessage.includes("getaddrinfo")) {
      errorType = "HOST_NOT_FOUND"
      fixSuggestion = "Database host not found. Check the hostname in DATABASE_URL."
    } else if (errorMessage.includes("relation") || errorMessage.includes("does not exist")) {
      errorType = "TABLE_NOT_FOUND"
      fixSuggestion = "Database tables not created. Run: npx prisma migrate deploy"
    }
    
    return NextResponse.json({
      success: false,
      error: "❌ Database connection failed",
      errorType,
      details: errorMessage,
      diagnostics,
      fix: fixSuggestion || "Check DATABASE_URL format: postgresql://user:password@host:port/database",
    }, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
    } catch {
      // Ignore disconnect errors
    }
  }
}
