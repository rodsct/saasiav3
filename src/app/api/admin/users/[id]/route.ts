import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { requireAdmin } from "@/utils/adminAuth";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    const { subscription, role } = body;
    const userId = params.id;

    // Prepare update data
    const updateData: any = {};
    
    // Handle subscription update
    if (subscription !== undefined) {
      updateData.subscription = subscription;
      
      // Calculate subscription end date if upgrading to PRO
      if (subscription === "PRO") {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        updateData.subscriptionEndsAt = endDate;
      } else if (subscription === "FREE") {
        updateData.subscriptionEndsAt = null;
      }
    }
    
    // Handle role update
    if (role !== undefined) {
      updateData.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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