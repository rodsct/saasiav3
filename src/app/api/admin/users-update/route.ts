import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

// Simplified user update endpoint that just checks for rodsct@gmail.com as admin
export async function PATCH(request: NextRequest) {
  try {
    console.log("Simple user update API called");
    
    // Simple auth check - just verify rodsct@gmail.com exists and is ADMIN
    const adminEmail = "rodsct@gmail.com";
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { role: true }
    });
    
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { userId, subscription, role } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    console.log("Admin check passed, updating user:", userId);

    // Build update data
    const updateData: any = {};
    if (subscription !== undefined) {
      updateData.subscription = subscription;
      if (subscription === "PRO") {
        updateData.subscriptionEndsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }
    }
    if (role !== undefined) {
      updateData.role = role;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true,
        subscriptionEndsAt: true,
        role: true,
      }
    });

    console.log("User updated successfully:", updatedUser);
    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error) {
    console.error("Simple user update error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}