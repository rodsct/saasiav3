import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

// WARNING: This is a temporary endpoint for debugging admin issues
// Remove this in production!

export async function POST(request: NextRequest) {
  try {
    console.log("🚨 Make admin endpoint called");
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log(`🔍 Looking for user with email: ${email}`);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`✅ User found: ${user.email}, Current role: ${user.role}`);

    // Update user to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        role: "ADMIN",
        subscription: "PRO" // Also give PRO access
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: true
      }
    });

    console.log(`🎉 User promoted: ${updatedUser.email} is now ${updatedUser.role} with ${updatedUser.subscription} subscription`);

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.email} promoted to ADMIN with PRO subscription`,
      user: updatedUser
    });

  } catch (error) {
    console.error("❌ Make admin error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("🔍 Getting all users with their roles");
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    console.log(`📊 Found ${users.length} users`);
    users.forEach(user => {
      console.log(`  - ${user.email}: ${user.role}, ${user.subscription}`);
    });

    return NextResponse.json({
      users,
      count: users.length,
      message: "All users retrieved"
    });

  } catch (error) {
    console.error("❌ Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}