import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/utils/adminAuth";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

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