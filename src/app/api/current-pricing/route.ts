import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCurrentPricing, initializePricingConfig } from "@/utils/dbPricing";

export async function GET() {
  try {
    // Try to get pricing from database first
    const dbPricing = await getCurrentPricing();
    
    if (dbPricing.priceId !== 'price_default') {
      return NextResponse.json({
        success: true,
        pricing: {
          id: dbPricing.priceId,
          unit_amount: dbPricing.amount,
          nickname: dbPricing.name,
          price_dollars: dbPricing.amount / 100,
          currency: "USD"
        },
        source: "database"
      });
    }

    // Fallback to file-based pricing if database doesn't have valid data
    const pricingPath = path.join(process.cwd(), "src", "stripe", "pricingData.ts");
    const pricingContent = fs.readFileSync(pricingPath, 'utf8');
    
    // Extract price information using regex
    const unitAmountMatch = pricingContent.match(/unit_amount:\s*(\d+)/);
    const nicknameMatch = pricingContent.match(/nickname:\s*"([^"]+)"/);
    const idMatch = pricingContent.match(/id:\s*"([^"]+)"/);
    
    if (!unitAmountMatch) {
      return NextResponse.json(
        { error: "Could not parse pricing data" },
        { status: 500 }
      );
    }

    const unitAmount = parseInt(unitAmountMatch[1]);
    const nickname = nicknameMatch ? nicknameMatch[1] : "PRO";
    const id = idMatch ? idMatch[1] : "";

    return NextResponse.json({
      success: true,
      pricing: {
        id,
        unit_amount: unitAmount,
        nickname,
        price_dollars: unitAmount / 100,
        currency: "USD"
      },
      source: "file"
    });

  } catch (error) {
    console.error("Error reading current pricing:", error);
    return NextResponse.json(
      { error: "Failed to read current pricing" },
      { status: 500 }
    );
  }
}