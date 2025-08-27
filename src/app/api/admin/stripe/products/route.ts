import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Simple auth check using headers (same pattern as WhatsApp config)
  const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // For now, return mock data. In production, integrate with Stripe API
    const products = [
      {
        id: "price_pro_monthly_49",
        name: "PRO Monthly Subscription",
        amount: 4900,
        currency: "usd",
        interval: "month",
        active: true
      }
    ];

    return NextResponse.json({ products });

  } catch (error) {
    console.error("Get Stripe products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}