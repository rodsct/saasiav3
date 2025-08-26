import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

// Simple test endpoint without auth to debug admin API issues
export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Test admin endpoint called");
    
    // Test basic database connection
    const userCount = await prisma.user.count();
    console.log("Total users:", userCount);
    
    // Get users with basic info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true,
        role: true,
      },
      orderBy: { id: "desc" },
      take: 5
    });
    
    console.log("Sample users:", users);
    
    return NextResponse.json({
      success: true,
      message: "Test admin endpoint working",
      data: {
        totalUsers: userCount,
        sampleUsers: users
      }
    });
    
  } catch (error) {
    console.error("❌ Test admin error:", error);
    return NextResponse.json(
      { 
        error: "Test failed", 
        details: error?.message,
        stack: error?.stack 
      },
      { status: 500 }
    );
  }
}