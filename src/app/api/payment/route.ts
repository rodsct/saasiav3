import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    // Simple auth check using headers (same pattern as other endpoints)
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    if (!authHeader) {
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

    console.log("Creating Stripe session for price:", priceId);

    // Get current pricing from local file
    let finalPriceId = priceId;
    
    try {
      const fs = require('fs');
      const path = require('path');
      const pricingPath = path.join(process.cwd(), "src", "stripe", "pricingData.ts");
      const pricingContent = fs.readFileSync(pricingPath, 'utf8');
      
      // Extract price ID from the file
      const idMatch = pricingContent.match(/id:\s*"([^"]+)"/);
      if (idMatch) {
        finalPriceId = idMatch[1];
        console.log("Using current price ID from file:", finalPriceId);
      }
    } catch (fileError) {
      console.log("Could not read pricing file, using provided price ID");
    }
    
    // Verify the price exists in Stripe
    try {
      const priceDetails = await stripe.prices.retrieve(finalPriceId);
      console.log("Price verified in Stripe:", finalPriceId, "Amount:", priceDetails.unit_amount);
    } catch (priceError: any) {
      console.error("Price not found in Stripe:", finalPriceId);
      return NextResponse.json(
        { error: `Price ${finalPriceId} not found in Stripe. Please update pricing in admin panel.` },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}&plan=pro&price=49`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        originalPriceId: priceId,
        finalPriceId: finalPriceId,
      },
    });

    // Return checkout URL
    return NextResponse.json(session.url);

  } catch (error: any) {
    console.error("Payment API error:", error);
    
    // Detailed error logging
    if (error?.type === 'StripeError') {
      console.error("Stripe API Error:", error.message, "Code:", error.code);
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
