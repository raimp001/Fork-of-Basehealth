/**
 * Database Connection Test Endpoint
 * 
 * Use this to verify database connectivity without attempting registration
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Try a simple query
    const providerCount = await prisma.provider.count()
    
    // Check if Prisma client is working
    const isConnected = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      providerCount,
      databaseUrl: process.env.DATABASE_URL ? "Set (hidden)" : "Not set",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Database test failed', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      details: errorMessage,
      databaseUrl: process.env.DATABASE_URL ? "Set (hidden)" : "NOT SET - This is the problem!",
      hint: !process.env.DATABASE_URL 
        ? "DATABASE_URL environment variable is not set in Vercel. Go to Settings → Environment Variables and add it."
        : "Check your DATABASE_URL connection string format: postgresql://user:password@host:port/database?schema=public",
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
