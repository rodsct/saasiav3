import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/jwtAuth";
import { prisma } from "@/utils/prismaDB";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(request);
    if (!user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const priceId = data.priceId;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // For demo/development: simulate payment and activate subscription directly
    if (priceId === "price_pro_monthly_49") {
      // Calculate subscription end date (1 month from now)
      const subscriptionEndsAt = new Date();
      subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);

      // Update user subscription in database
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          subscription: "PRO",
          subscriptionEndsAt: subscriptionEndsAt,
        },
      });

      console.log(`✅ PRO subscription activated for user: ${user.email}`);

      // Return success URL for redirect
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      return NextResponse.json(`${baseUrl}/subscription-success?plan=pro&price=49`);
    }

    return NextResponse.json(
      { error: "Invalid price ID" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
