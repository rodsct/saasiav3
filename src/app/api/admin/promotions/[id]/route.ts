import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { requireAdmin } from "@/utils/adminAuth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { isActive } = await request.json();
    const promotionId = params.id;

    const updatedPromotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: { isActive },
    });

    return NextResponse.json({ promotion: updatedPromotion });

  } catch (error) {
    console.error("Update promotion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const promotionId = params.id;

    await prisma.promotion.delete({
      where: { id: promotionId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete promotion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}