import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prismaDB";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";

export async function checkAdminAuth(request?: NextRequest) {
  // First try NextAuth session
  const session = await getServerSession(authOptions);
  
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, role: true }
    });

    if (user && user.role === "ADMIN") {
      return user;
    }
  }

  // If no NextAuth session, try JWT cookie
  if (request) {
    const token = request.cookies.get("auth-token")?.value;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, role: true }
        });

        if (user && user.role === "ADMIN") {
          return user;
        }
      } catch (error) {
        console.error("JWT verification error:", error);
      }
    }
  }

  return null;
}

export async function requireAdmin(request: NextRequest) {
  const admin = await checkAdminAuth(request);
  
  if (!admin) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  return admin;
}