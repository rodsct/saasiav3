import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/jwtAuth";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user subscription data
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscription: true,
        subscriptionEndsAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const isActive = dbUser.subscription === "PRO" && 
                    (!dbUser.subscriptionEndsAt || dbUser.subscriptionEndsAt > now);

    return NextResponse.json({
      subscription: dbUser.subscription,
      endsAt: dbUser.subscriptionEndsAt,
      isActive,
      daysRemaining: dbUser.subscriptionEndsAt 
        ? Math.max(0, Math.ceil((dbUser.subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
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