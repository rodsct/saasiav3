import { NextRequest, NextResponse } from "next/server";

// Temporary in-memory storage for promotions (same pattern as WhatsApp config)
let tempPromotions: any[] = [
  {
    id: "WELCOME20",
    code: "WELCOME20", 
    description: "20% de descuento para nuevos usuarios",
    discountType: "percentage",
    discountValue: 20,
    usageLimit: 100,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  // Simple auth check using headers (same pattern as other admin endpoints)
  const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json({ promotions: tempPromotions });

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

    // Check if code already exists
    const existingPromo = tempPromotions.find(p => p.code === code.toUpperCase());
    if (existingPromo) {
      return NextResponse.json(
        { error: "El código de promoción ya existe" },
        { status: 400 }
      );
    }

    // Create new promotion in memory
    const newPromotion = {
      id: code.toUpperCase(),
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      usageLimit,
      usedCount: 0,
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      createdAt: new Date().toISOString()
    };

    tempPromotions.push(newPromotion);

    return NextResponse.json({ promotion: newPromotion });

  } catch (error) {
    console.error("Create promotion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}