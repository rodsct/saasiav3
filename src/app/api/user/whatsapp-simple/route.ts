import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function POST(request: NextRequest) {
  try {
    console.log("📱 WhatsApp Simple API called");
    
    const body = await request.json();
    const { whatsapp, userEmail } = body;
    
    console.log("📧 User email from frontend:", userEmail);
    console.log("📱 WhatsApp number:", whatsapp);

    if (!userEmail || typeof userEmail !== 'string') {
      return NextResponse.json({
        error: "User email is required"
      }, { status: 400 });
    }

    if (!whatsapp || typeof whatsapp !== 'string') {
      return NextResponse.json({
        error: "Valid WhatsApp number is required"
      }, { status: 400 });
    }

    // Basic phone validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = whatsapp.replace(/\s+/g, "");
    
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json({
        error: "Please enter a valid WhatsApp number with country code"
      }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { 
        id: true, 
        subscription: true, 
        subscriptionEndsAt: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json({
        error: "User not found"
      }, { status: 404 });
    }

    console.log("👤 User found:", user);

    // Check if user has PRO subscription
    const isSubscriptionActive = user.subscription === "PRO" && 
      (!user.subscriptionEndsAt || new Date() <= new Date(user.subscriptionEndsAt));

    if (!isSubscriptionActive) {
      return NextResponse.json({
        error: "PRO subscription required for WhatsApp integration"
      }, { status: 403 });
    }

    // Update user's WhatsApp number
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { whatsapp: cleanPhone },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        subscription: true
      },
    });

    console.log("✅ WhatsApp updated successfully:", updatedUser);

    return NextResponse.json({
      success: true,
      message: "WhatsApp number updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("💥 WhatsApp simple update error:", error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}