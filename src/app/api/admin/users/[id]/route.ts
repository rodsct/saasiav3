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
    const { subscription } = await request.json();
    const userId = params.id;

    // Calculate subscription end date if upgrading to PRO
    let subscriptionEndsAt = null;
    if (subscription === "PRO") {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      subscriptionEndsAt = endDate;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscription,
        subscriptionEndsAt,
      },
    });

    return NextResponse.json({ user: updatedUser });

  } catch (error) {
    console.error("Update user error:", error);
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
    const userId = params.id;

    // Delete user and all related data
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}