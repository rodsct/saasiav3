import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { requireAdmin } from "@/utils/adminAuth";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true,
        subscriptionEndsAt: true,
        role: true,
        _count: {
          select: {
            downloads: true,
            conversations: true,
          }
        }
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error("Admin get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}