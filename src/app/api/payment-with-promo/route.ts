import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { findTempPromotion } from "@/utils/tempPromotions";

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
    let discountAmount = 0;
    let discountType = "PERCENTAGE";
    
    if (promoCode) {
      const promotion = findTempPromotion(promoCode);
      
      if (!promotion) {
        return NextResponse.json(
          { error: "Código de promoción inválido" },
          { status: 400 }
        );
      }
      
      if (promotion.expiresAt && new Date(promotion.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: "Código de promoción expirado" },
          { status: 400 }
        );
      }
      
      discountType = promotion.discountType;
      if (promotion.discountType === "PERCENTAGE") {
        discountPercentage = promotion.discountValue;
      } else {
        discountAmount = promotion.discountValue * 100; // Convert to cents
      }
      
      console.log("Promotion found:", promotion.code, "Type:", discountType, "Value:", promotion.discountValue);
    }

    // Use the existing Stripe price ID instead of creating new ones
    let finalPriceId = "price_1RzoxvIXvj4hGUgkm0F1JN6p"; // Your real Stripe price
    
    // If it's a custom price from admin, try to use it, but fallback to the real one
    if (priceId !== "price_pro_monthly_49") {
      finalPriceId = priceId;
      
      // Try to verify if custom price exists, if not use the real one
      try {
        await stripe.prices.retrieve(finalPriceId);
        console.log("Custom price found in Stripe:", finalPriceId);
      } catch (priceError: any) {
        console.log("Custom price not found, using default:", "price_1RzoxvIXvj4hGUgkm0F1JN6p");
        finalPriceId = "price_1RzoxvIXvj4hGUgkm0F1JN6p";
      }
    }

    console.log("Using final price ID for promo:", finalPriceId);

    // Create Stripe checkout session
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    const sessionConfig: any = {
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}&plan=pro&price=${finalPriceId}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        originalPriceId: priceId,
        finalPriceId: finalPriceId,
        promoCode: promoCode || '',
      },
    };

    // Add discount if promo code is valid
    if (discountPercentage > 0 || discountAmount > 0) {
      let couponId: string;
      
      if (discountType === "PERCENTAGE") {
        couponId = `${promoCode.toUpperCase()}-${discountPercentage}PCT`;
        try {
          await stripe.coupons.retrieve(couponId);
          console.log("Using existing percentage coupon:", couponId);
        } catch {
          console.log("Creating new percentage coupon:", couponId);
          await stripe.coupons.create({
            id: couponId,
            percent_off: discountPercentage,
            duration: 'forever',
            name: `${promoCode.toUpperCase()} - ${discountPercentage}% descuento`,
          });
        }
      } else {
        couponId = `${promoCode.toUpperCase()}-${discountAmount / 100}USD`;
        try {
          await stripe.coupons.retrieve(couponId);
          console.log("Using existing amount coupon:", couponId);
        } catch {
          console.log("Creating new amount coupon:", couponId);
          await stripe.coupons.create({
            id: couponId,
            amount_off: discountAmount,
            currency: 'usd',
            duration: 'forever',
            name: `${promoCode.toUpperCase()} - $${discountAmount / 100} descuento`,
          });
        }
      }
      
      sessionConfig.discounts = [{
        coupon: couponId,
      }];
      
      console.log("Applied discount:", discountType === "PERCENTAGE" ? `${discountPercentage}%` : `$${discountAmount / 100}`, "with coupon:", couponId);
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Return checkout URL
    return NextResponse.json({
      url: session.url,
      discount_applied: discountPercentage > 0 || discountAmount > 0,
      discount_percentage: discountPercentage,
      discount_amount: discountAmount / 100,
      discount_type: discountType
    });

  } catch (error: any) {
    console.error("Payment with promo API error:", error);
    
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