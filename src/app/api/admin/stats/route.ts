import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { requireAdmin } from "@/utils/adminAuth";

export async function GET(request: NextRequest) {
  console.log("Admin stats API called");
  
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) {
    console.log("Admin check failed");
    return adminCheck;
  }
  
  console.log("Admin check passed");

  try {
    console.log("Getting stats data...");
    
    // Get total users count
    console.log("Counting total users...");
    const totalUsers = await prisma.user.count();
    console.log("Total users:", totalUsers);

    // Get PRO users count (excluding admins)
    console.log("Counting PRO users...");
    const proUsers = await prisma.user.count({
      where: { 
        subscription: "PRO",
        role: { not: "ADMIN" }
      }
    });
    console.log("PRO users (excluding admins):", proUsers);

    // Get total downloads count (make this optional in case the table doesn't exist)
    console.log("Counting downloads...");
    let totalDownloads = 0;
    try {
      totalDownloads = await prisma.download.count();
      console.log("Total downloads:", totalDownloads);
    } catch (downloadError) {
      console.log("Downloads table might not exist yet:", downloadError);
    }

    // Calculate total revenue (PRO users * $49, excluding admins)
    const totalRevenue = proUsers * 49;
    console.log("Total revenue (excluding admins):", totalRevenue);

    // Get recent users
    console.log("Getting recent users...");
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subscription: true,
      },
      orderBy: { id: "desc" },
      take: 10,
    });
    console.log("Recent users count:", recentUsers.length);

    const response = {
      totalUsers,
      proUsers,
      totalDownloads,
      totalRevenue,
      recentUsers,
    };
    
    console.log("Sending response:", response);
    return NextResponse.json(response);

  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}