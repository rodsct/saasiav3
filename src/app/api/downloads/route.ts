import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only authenticated users can access downloads - no public access
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Show content based on user subscription level
    const user = session.user as any;
    const userSubscription = user.subscription || "FREE";
    
    let whereCondition: any;
    
    if (userSubscription === "PREMIUM") {
      // Premium users can see registered and premium content
      whereCondition = {
        accessLevel: {
          in: ["REGISTERED", "PREMIUM"]
        }
      };
    } else {
      // Registered users can only see registered content
      whereCondition = {
        accessLevel: "REGISTERED"
      };
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