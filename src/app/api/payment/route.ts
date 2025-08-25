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

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured. Please add STRIPE_SECRET_KEY to environment." },
        { status: 500 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    // Create Stripe checkout session
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}&plan=pro&price=49`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        userEmail: user.email || '',
      },
    });

    // Return checkout URL
    return NextResponse.json(session.url);

  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
