import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { updatePricingConfig, getCurrentPricing, initializePricingConfig } from "@/utils/dbPricing";

export async function POST(request: NextRequest) {
  // Simple auth check using headers (same pattern as other admin endpoints)
  const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pricingData = await request.json();

    // Validate pricing data
    if (!pricingData.unit_amount || !pricingData.nickname) {
      return NextResponse.json(
        { error: "Missing required pricing fields" },
        { status: 400 }
      );
    }

    // Generate price ID based on amount if not provided or if it's being updated
    const newPriceId = `price_pro_monthly_${pricingData.unit_amount / 100}`;
    pricingData.id = newPriceId;

    // Check if Stripe is configured
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2023-10-16",
        });

        console.log("Creating/updating price in Stripe:", newPriceId, "Amount:", pricingData.unit_amount);

        // Create or get product
        let product;
        try {
          product = await stripe.products.retrieve('prod_saasiav3_pro');
          console.log("Product found:", product.id);
        } catch {
          console.log("Creating new product...");
          product = await stripe.products.create({
            id: 'prod_saasiav3_pro',
            name: 'SaaS IA v3 - PRO Subscription',
            description: 'Acceso completo a la plataforma con IA avanzada',
          });
          console.log("Product created:", product.id);
        }

        // Deactivate old prices first
        try {
          const existingPrices = await stripe.prices.list({
            product: product.id,
            active: true
          });
          
          for (const price of existingPrices.data) {
            console.log("Deactivating old price:", price.id);
            await stripe.prices.update(price.id, { active: false });
          }
        } catch (error) {
          console.log("Error deactivating old prices:", error);
        }

        // Create new price in Stripe
        let finalPriceId = newPriceId;
        try {
          const newPrice = await stripe.prices.create({
            unit_amount: pricingData.unit_amount,
            currency: 'usd',
            recurring: { interval: 'month' },
            product: product.id,
            nickname: pricingData.nickname,
            active: true
          });
          
          finalPriceId = newPrice.id;
          pricingData.id = finalPriceId;
          
          console.log("New price created in Stripe with ID:", finalPriceId);
          
        } catch (stripeError: any) {
          console.error("Stripe price creation error:", stripeError);
          return NextResponse.json(
            { error: `Error creating price in Stripe: ${stripeError.message}` },
            { status: 500 }
          );
        }

      } catch (stripeError: any) {
        console.error("Stripe integration error:", stripeError);
        return NextResponse.json(
          { error: `Stripe error: ${stripeError.message}` },
          { status: 500 }
        );
      }
    }

    // Read current pricing file
    const pricingFilePath = path.join(process.cwd(), "src", "stripe", "pricingData.ts");
    
    // Create new pricing content
    const newPricingContent = `import { Price } from "@/types/price";

export const pricingData: Price[] = [
  {
    id: "${pricingData.id}",
    unit_amount: ${pricingData.unit_amount},
    nickname: "${pricingData.nickname}",
    offers: [
${pricingData.offers.map((offer: string) => `      "${offer}",`).join('\n')}
    ],
  },
];
`;

    // Write updated pricing file (for backwards compatibility)
    await fs.writeFile(pricingFilePath, newPricingContent, 'utf8');

    // Update pricing in database for persistent storage
    const dbUpdateSuccess = await updatePricingConfig({
      priceId: pricingData.id,
      amount: pricingData.unit_amount,
      name: pricingData.nickname
    });

    if (!dbUpdateSuccess) {
      console.warn("Failed to update pricing in database, but file was updated");
    }

    return NextResponse.json({
      success: true,
      message: "Pricing updated successfully",
      updatedPriceId: pricingData.id,
      databaseUpdated: dbUpdateSuccess
    });

  } catch (error) {
    console.error("Update pricing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}