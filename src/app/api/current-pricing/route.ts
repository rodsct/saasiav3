import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Read current pricing from file
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
      }
    });

  } catch (error) {
    console.error("Error reading current pricing:", error);
    return NextResponse.json(
      { error: "Failed to read current pricing" },
      { status: 500 }
    );
  }
}