import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prismaDB";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";

export async function getAuthenticatedUser(request: NextRequest) {
  // First try NextAuth session
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return session.user;
  }

  // Try JWT cookie
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
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

    return user;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}