import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { requireAdmin } from "@/utils/adminAuth";

export async function GET(request: NextRequest) {
  console.log("Admin users API called");
  
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) {
    console.log("Admin check failed");
    return adminCheck;
  }
  
  console.log("Admin check passed");

  try {
    console.log("Getting users data...");
    
    // Get users with basic info first (without relations that might not exist)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true,
        subscriptionEndsAt: true,
        role: true,
        emailVerified: true,
      },
      orderBy: { id: "desc" },
    });

    console.log("Found users:", users.length);

    // Try to get counts separately and handle errors gracefully
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        let downloadCount = 0;
        let conversationCount = 0;

        try {
          // Try to count downloads
          downloadCount = await prisma.download.count({
            where: { userId: user.id }
          });
        } catch (downloadError) {
          console.log("Download count error for user", user.id, ":", downloadError.message);
        }

        try {
          // Try to count conversations
          conversationCount = await prisma.conversation.count({
            where: { userId: user.id }
          });
        } catch (conversationError) {
          console.log("Conversation count error for user", user.id, ":", conversationError.message);
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
    console.error("Admin get users error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}