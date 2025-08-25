import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { requireAdmin } from "@/utils/adminAuth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { months } = await request.json();
    const userId = params.id;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionEndsAt: true, subscription: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate new end date
    const currentEndDate = user.subscriptionEndsAt || new Date();
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);

    // Update user subscription
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: "PRO", // Ensure they have PRO when extending
        subscriptionEndsAt: newEndDate,
      },
    });

    return NextResponse.json({ user: updatedUser });

  } catch (error) {
    console.error("Extend subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}