import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prismaDB";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";

export async function checkAdminAuth(request?: NextRequest) {
  console.log("Checking admin auth...");
  
  // First try NextAuth session
  console.log("Trying NextAuth session...");
  const session = await getServerSession(authOptions);
  
  if (session?.user?.id) {
    console.log("NextAuth session found, user ID:", session.user.id);
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, role: true }
      });

      console.log("User found from NextAuth session:", user);
      
      if (user && user.role === "ADMIN") {
        console.log("Admin user authenticated via NextAuth");
        return user;
      } else {
        console.log("User is not admin, role:", user?.role);
      }
    } catch (error) {
      console.error("Error getting user from NextAuth session:", error);
    }
  } else {
    console.log("No NextAuth session found");
  }

  // If no NextAuth session, try JWT cookie
  if (request) {
    console.log("Trying JWT cookie...");
    const token = request.cookies.get("auth-token")?.value;
    
    if (token) {
      console.log("JWT token found");
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log("JWT decoded user ID:", decoded.userId);
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, role: true }
        });

        console.log("User found from JWT:", user);
        
        if (user && user.role === "ADMIN") {
          console.log("Admin user authenticated via JWT");
          return user;
        } else {
          console.log("User is not admin, role:", user?.role);
        }
      } catch (error) {
        console.error("JWT verification error:", error);
      }
    } else {
      console.log("No JWT token found");
    }
  } else {
    console.log("No request provided, skipping JWT check");
  }

  console.log("Admin auth check failed");
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