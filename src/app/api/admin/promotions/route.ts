import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { requireAdmin } from "@/utils/adminAuth";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" }
    });

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
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

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

    const promotion = await prisma.promotion.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        usageLimit,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    });

    return NextResponse.json({ promotion });

  } catch (error) {
    console.error("Create promotion error:", error);
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: "El código de promoción ya existe" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}