import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured. Please contact support." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    
    const data = await request.json();
    const priceId = data.priceId;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // For our PRO plan, create a simple success page redirect since we don't have real Stripe setup
    // In production, you would create actual Stripe checkout session
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    // Simulate Stripe checkout - in production you'd use actual Stripe
    if (priceId === "price_pro_monthly_49") {
      // For demo purposes, redirect to a success page
      // In production, create actual Stripe checkout session here
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
