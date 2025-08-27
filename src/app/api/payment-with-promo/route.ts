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
    const { priceId, promoCode } = data;

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

    console.log("Creating Stripe session for price:", priceId, "with promo:", promoCode);

    // Validate promotion code if provided
    let discountPercentage = 0;
    if (promoCode) {
      // Simple validation - in production this would check the database
      const validPromoCodes = ['WELCOME20', 'SAVE30', 'FIRST50'];
      if (validPromoCodes.includes(promoCode.toUpperCase())) {
        if (promoCode.toUpperCase() === 'WELCOME20') discountPercentage = 20;
        if (promoCode.toUpperCase() === 'SAVE30') discountPercentage = 30;
        if (promoCode.toUpperCase() === 'FIRST50') discountPercentage = 50;
      } else {
        return NextResponse.json(
          { error: "Código de promoción inválido" },
          { status: 400 }
        );
      }
    }

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
        
        // Extract price amount from ID or use default
        let priceAmount = 4900; // default $49
        const priceMatch = priceId.match(/price_pro_monthly_(\d+)/);
        if (priceMatch) {
          priceAmount = parseInt(priceMatch[1]) * 100;
        }
        
        // Create the price
        await stripe.prices.create({
          id: priceId,
          unit_amount: priceAmount,
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
    
    const sessionConfig: any = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}&plan=pro&price=${priceId}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        priceId: priceId,
      },
    };

    // Add discount if promo code is valid
    if (discountPercentage > 0) {
      // Create or get coupon
      let couponId = `${promoCode.toUpperCase()}-${discountPercentage}PCT`;
      try {
        await stripe.coupons.retrieve(couponId);
        console.log("Using existing coupon:", couponId);
      } catch {
        console.log("Creating new coupon:", couponId);
        await stripe.coupons.create({
          id: couponId,
          percent_off: discountPercentage,
          duration: 'forever', // Apply discount for the lifetime of subscription
          name: `${promoCode.toUpperCase()} - ${discountPercentage}% descuento`,
        });
      }
      
      sessionConfig.discounts = [{
        coupon: couponId,
      }];
      
      console.log("Applied discount:", discountPercentage, "% with coupon:", couponId);
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Return checkout URL
    return NextResponse.json({
      url: session.url,
      discount_applied: discountPercentage > 0,
      discount_percentage: discountPercentage
    });