import { NextRequest, NextResponse } from "next/server";
import { loadPromotionsFromFile, addPromotion } from "@/utils/persistentPromotions";

export async function GET(request: NextRequest) {
  // Simple auth check using headers (same pattern as other admin endpoints)
  const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json({ promotions: loadPromotionsFromFile() });

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

    // Create new promotion
    const newPromotion = {
      id: code.toUpperCase(),
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      usageLimit,
      usedCount: 0,
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      createdAt: new Date().toISOString()
    };

    const success = addPromotion(newPromotion);
    
    if (!success) {
      return NextResponse.json(
        { error: "El código de promoción ya existe" },
        { status: 400 }
      );
    }

    console.log("Promotion created and saved to file:", newPromotion.code);
    return NextResponse.json({ promotion: newPromotion });

  } catch (error) {
    console.error("Create promotion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}