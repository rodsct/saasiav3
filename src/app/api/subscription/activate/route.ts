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

    const { plan, price } = await request.json();

    if (plan !== "PRO" || price !== 49) {
      return NextResponse.json(
        { error: "Invalid subscription plan" },
        { status: 400 }
      );
    }

    // Calculate subscription end date (1 month from now)
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);

    // Update user subscription in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscription: "PRO",
        subscriptionEndsAt: subscriptionEndsAt,
      },
    });

    console.log(`✅ PRO subscription activated for user: ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: "PRO subscription activated successfully",
      subscription: {
        plan: "PRO",
        price: 49,
        endsAt: subscriptionEndsAt,
      },
    });

  } catch (error) {
    console.error("Subscription activation error:", error);
    return NextResponse.json(
      { error: "Failed to activate subscription" },
      { status: 500 }
    );
  }
}