import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";

export async function GET(request: NextRequest) {
  try {
    let user: any = null;
    
    // First try NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      user = session.user;
    } else {
      // Try JWT cookie
      const token = request.cookies.get("auth-token")?.value;
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          
          const dbUser = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
              id: true,
              email: true,
              name: true,
              subscription: true,
              subscriptionEndsAt: true,
              role: true,
            },
          });

          if (dbUser) {
            user = dbUser;
          }
        } catch (error) {
          console.error("JWT verification error:", error);
        }
      }
    }
    
    // Only authenticated users can access downloads - no public access
    if (!user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Show content based on user subscription level
    const userSubscription = user.subscription || "FREE";
    
    let whereCondition: any;
    
    if (userSubscription === "PRO") {
      // PRO users can see registered and PRO content
      whereCondition = {
        accessLevel: {
          in: ["REGISTERED", "PRO"]
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