import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user subscription data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscription: true,
        subscriptionEndsAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const isActive = user.subscription === "PRO" && 
                    (!user.subscriptionEndsAt || user.subscriptionEndsAt > now);

    return NextResponse.json({
      subscription: user.subscription,
      endsAt: user.subscriptionEndsAt,
      isActive,
      daysRemaining: user.subscriptionEndsAt 
        ? Math.max(0, Math.ceil((user.subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0,
    });

  } catch (error) {
    console.error("Subscription status error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}