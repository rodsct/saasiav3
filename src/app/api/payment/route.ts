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

    try {
      // First verify if the price exists in Stripe
      await stripe.prices.retrieve(priceId);
      console.log("Price found in Stripe:", priceId);
    } catch (priceError: any) {
      console.error("Price not found in Stripe:", priceError.message);
      
      // If price doesn't exist, create it
      if (priceError.code === 'resource_missing') {
        console.log("Creating new price in Stripe...");
        
        // First create or get product
        let product;
        try {
          product = await stripe.products.retrieve('prod_saasiav3_pro');
        } catch {
          product = await stripe.products.create({
            id: 'prod_saasiav3_pro',
            name: 'SaaS IA v3 - PRO Subscription',
            description: 'Acceso completo a la plataforma con IA avanzada',
          });
        }
        
        // Create the price
        await stripe.prices.create({
          id: priceId,
          unit_amount: 4900, // $49.00
          currency: 'usd',
          recurring: { interval: 'month' },
          product: product.id,
        });
        
        console.log("Price created successfully in Stripe");
      } else {
        throw priceError;
      }
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    const session = await stripe.checkout.sessions.create({
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
        priceId: priceId,
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
