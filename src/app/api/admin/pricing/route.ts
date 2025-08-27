import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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

        console.log("Creating/updating price in Stripe:", pricingData.id, "Amount:", pricingData.unit_amount);

        // Create or get product
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

        // Create new price in Stripe (Stripe doesn't allow updating prices, only creating new ones)
        try {
          await stripe.prices.create({
            id: newPriceId,
            unit_amount: pricingData.unit_amount,
            currency: 'usd',
            recurring: { interval: 'month' },
            product: product.id,
          });
          
          console.log("Price created in Stripe with ID:", newPriceId);
          
        } catch (stripeError: any) {
          if (stripeError.code === 'resource_already_exists') {
            console.log("Price already exists in Stripe:", newPriceId);
          } else {
            console.error("Stripe price creation error:", stripeError);
            // Continue anyway - the local file will be updated
          }
        }

      } catch (stripeError) {
        console.error("Stripe integration error:", stripeError);
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

    // Write updated pricing file
    await fs.writeFile(pricingFilePath, newPricingContent, 'utf8');

    return NextResponse.json({
      success: true,
      message: "Pricing updated successfully",
      updatedPriceId: pricingData.id
    });

  } catch (error) {
    console.error("Update pricing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}