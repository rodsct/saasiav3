import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { requireAdmin } from "@/utils/adminAuth";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get PRO users count
    const proUsers = await prisma.user.count({
      where: { subscription: "PRO" }
    });

    // Get total downloads count
    const totalDownloads = await prisma.download.count();

    // Calculate total revenue (PRO users * $49)
    const totalRevenue = proUsers * 49;

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subscription: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      totalUsers,
      proUsers,
      totalDownloads,
      totalRevenue,
      recentUsers,
    });

  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}