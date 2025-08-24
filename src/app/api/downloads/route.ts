import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow both authenticated and unauthenticated users to see public files
    let whereCondition: any;
    
    if (!session?.user?.id) {
      // Not authenticated - only show public files
      whereCondition = {
        accessLevel: "PUBLIC"
      };
    } else {
      // Authenticated - show public, registered, and premium based on user subscription
      const user = session.user as any;
      const userSubscription = user.subscription || "FREE";
      
      if (userSubscription === "PREMIUM") {
        // Premium users can see everything
        whereCondition = {
          accessLevel: {
            in: ["PUBLIC", "REGISTERED", "PREMIUM"]
          }
        };
      } else {
        // Free users can see public and registered content
        whereCondition = {
          accessLevel: {
            in: ["PUBLIC", "REGISTERED"]
          }
        };
      }
    }

    const downloads = await prisma.download.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ downloads });

  } catch (error) {
    console.error("Get downloads error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Regular users cannot upload files - only admins can upload
// This endpoint is disabled for regular users
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Only administrators can upload files" },
    { status: 403 }
  );
}