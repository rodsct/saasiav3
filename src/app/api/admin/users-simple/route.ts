import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

// Simplified admin users endpoint that just checks for rodsct@gmail.com as admin
export async function GET(request: NextRequest) {
  try {
    console.log("Simple admin users API called");
    
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

    // Get users with basic info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true,
        subscriptionEndsAt: true,
        role: true,
      },
      orderBy: { id: "desc" },
    });

    console.log("Found users:", users.length);

    // Add counts separately to avoid relation issues
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        let downloadCount = 0;
        let conversationCount = 0;

        try {
          downloadCount = await prisma.download.count({
            where: { userId: user.id }
          });
        } catch (error) {
          console.log("Download count error:", error.message);
        }

        try {
          conversationCount = await prisma.conversation.count({
            where: { userId: user.id }
          });
        } catch (error) {
          console.log("Conversation count error:", error.message);
        }

        return {
          ...user,
          _count: {
            downloads: downloadCount,
            conversations: conversationCount,
          }
        };
      })
    );

    console.log("Users with counts prepared");
    return NextResponse.json({ users: usersWithCounts });

  } catch (error) {
    console.error("Simple admin users error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message, stack: error?.stack },
      { status: 500 }
    );
  }
}