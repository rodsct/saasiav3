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
    if (!pricingData.id || !pricingData.unit_amount || !pricingData.nickname) {
      return NextResponse.json(
        { error: "Missing required pricing fields" },
        { status: 400 }
      );
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
    });

  } catch (error) {
    console.error("Update pricing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}