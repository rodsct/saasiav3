import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { email } = await request.json();
    
    // If no email provided, activate for current user
    const targetEmail = email || session.user.email;

    if (!targetEmail) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    // Calculate subscription end date (1 month from now)
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);

    // Update user subscription
    const updatedUser = await prisma.user.update({
      where: { email: targetEmail },
      data: {
        subscription: "PRO",
        subscriptionEndsAt: subscriptionEndsAt,
      },
    });

    console.log(`✅ PRO subscription activated for: ${targetEmail}`);

    return NextResponse.json({
      success: true,
      message: `PRO subscription activated for ${targetEmail}`,
      user: {
        email: updatedUser.email,
        subscription: updatedUser.subscription,
        subscriptionEndsAt: updatedUser.subscriptionEndsAt,
      },
    });

  } catch (error) {
    console.error("Debug activate PRO error:", error);
    return NextResponse.json(
      { error: "Failed to activate PRO subscription" },
      { status: 500 }
    );
  }
}