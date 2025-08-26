import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

// Simplified admin stats endpoint that just checks for rodsct@gmail.com as admin
export async function GET(request: NextRequest) {
  try {
    console.log("Simple admin stats API called");
    
    // Simple auth check - just verify rodsct@gmail.com exists and is ADMIN
    const adminEmail = "rodsct@gmail.com";
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { role: true }
    });
    
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required", adminEmail, adminUser },
        { status: 403 }
      );
    }
    
    console.log("Admin check passed");

    // Get total users count
    console.log("Counting total users...");
    const totalUsers = await prisma.user.count();
    console.log("Total users:", totalUsers);

    // Get PRO users count
    console.log("Counting PRO users...");
    const proUsers = await prisma.user.count({
      where: { subscription: "PRO" }
    });
    console.log("PRO users:", proUsers);

    // Get total downloads count (make this optional)
    console.log("Counting downloads...");
    let totalDownloads = 0;
    try {
      totalDownloads = await prisma.download.count();
      console.log("Total downloads:", totalDownloads);
    } catch (downloadError) {
      console.log("Downloads table might not exist yet:", downloadError);
    }

    // Calculate total revenue (PRO users * $49)
    const totalRevenue = proUsers * 49;
    console.log("Total revenue:", totalRevenue);

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
    console.error("Simple admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message, stack: error?.stack },
      { status: 500 }
    );
  }
}