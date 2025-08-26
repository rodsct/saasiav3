import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: NextRequest) {
  const checks = {
    api: false,
    database: false,
    users: 0,
    currentTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
    nextauthUrl: process.env.NEXTAUTH_URL || 'not set',
    nextauthSecret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
    uptime: process.uptime(),
    errors: []
  };

  console.log("🔥 Health check started at", checks.currentTime);

  // Check API
  try {
    checks.api = true;
    console.log("✅ API is responding");
  } catch (error) {
    console.error("❌ API check failed:", error);
    checks.errors.push(`API: ${error?.message}`);
  }

  // Check database connection
  try {
    console.log("🔍 Testing database connection...");
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
    console.log("✅ Database connected successfully");

    // Try to count users
    console.log("🔍 Testing user query...");
    const userCount = await prisma.user.count();
    checks.users = userCount;
    console.log(`✅ Found ${userCount} users in database`);

    // Try to get first user for testing
    const firstUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        role: true,
        subscription: true
      }
    });
    
    if (firstUser) {
      console.log(`✅ First user: ${firstUser.email}, Role: ${firstUser.role}, Subscription: ${firstUser.subscription}`);
    }

  } catch (error) {
    console.error("❌ Database check failed:", error);
    checks.errors.push(`Database: ${error?.message}`);
    checks.database = false;
  }

  const isHealthy = checks.api && checks.database;
  console.log("🎯 Health check result:", isHealthy ? "HEALTHY" : "UNHEALTHY");

  return NextResponse.json({
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: checks.currentTime,
    checks,
    message: isHealthy ? "All systems operational" : "Some systems have issues"
  }, {
    status: isHealthy ? 200 : 500
  });
}