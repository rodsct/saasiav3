import { NextRequest, NextResponse } from "next/server";
import { getAllPromotions, createPromotion } from "@/utils/dbPromotions";

export async function GET(request: NextRequest) {
  // Simple auth check using headers (same pattern as other admin endpoints)
  const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const promotions = await getAllPromotions();
    return NextResponse.json({ promotions });

  } catch (error) {
    console.error("Get promotions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Simple auth check using headers (same pattern as other admin endpoints)
  const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      usageLimit,
      expiresAt
    } = await request.json();

    if (!code || !description || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new promotion in database
    const result = await createPromotion({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      usageLimit,
      expiresAt
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Error al crear la promoción" },
        { status: 400 }
      );
    }

    console.log("Promotion created in database:", result.promotion?.code);
    return NextResponse.json({ promotion: result.promotion });

  } catch (error) {
    console.error("Create promotion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}