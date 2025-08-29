import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { sendSubscriptionActivated, sendSubscriptionCancelled } from "@/utils/emailService";

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

    // Get current user data to compare changes
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true,
        subscriptionEndsAt: true,
        role: true,
      }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    let subscriptionChanged = false;
    let oldSubscription = currentUser.subscription;
    let newSubscription = subscription;

    if (subscription !== undefined && subscription !== currentUser.subscription) {
      updateData.subscription = subscription;
      subscriptionChanged = true;
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

    // Send email notifications for subscription changes
    if (subscriptionChanged) {
      try {
        const userName = updatedUser.name || 'Usuario';
        
        if (newSubscription === "PRO" && oldSubscription !== "PRO") {
          // User upgraded to PRO
          await sendSubscriptionActivated(
            updatedUser.email,
            "PRO",
            "$49.00/mes",
            userName
          );
          console.log(`✅ Subscription activated email sent to: ${updatedUser.email}`);
        } else if (oldSubscription === "PRO" && newSubscription !== "PRO") {
          // User downgraded from PRO
          const expirationDate = updatedUser.subscriptionEndsAt 
            ? new Date(updatedUser.subscriptionEndsAt).toLocaleDateString()
            : 'inmediatamente';
          
          await sendSubscriptionCancelled(
            updatedUser.email,
            "PRO",
            expirationDate,
            userName
          );
          console.log(`✅ Subscription cancelled email sent to: ${updatedUser.email}`);
        }
      } catch (emailError) {
        console.error("Error sending subscription email:", emailError);
        // Don't fail the user update if email fails
      }
    }

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