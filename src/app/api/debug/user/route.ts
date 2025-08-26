import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/jwtAuth";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: NextRequest) {
  try {
    console.log("Debug user API called");
    
    const user = await getAuthenticatedUser(request);
    console.log("Authenticated user:", user);
    
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get full user details from database
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: true,
        subscriptionEndsAt: true,
        createdAt: true,
      }
    });

    console.log("Full user details:", fullUser);

    return NextResponse.json({ 
      authenticated: true,
      user: fullUser,
      isAdmin: fullUser?.role === "ADMIN"
    });

  } catch (error) {
    console.error("Debug user API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Debug user promotion API called");
    
    const user = await getAuthenticatedUser(request);
    console.log("Authenticated user:", user);
    
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Promote current user to ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: true,
      }
    });

    console.log("User promoted to ADMIN:", updatedUser);

    return NextResponse.json({ 
      success: true,
      message: "User promoted to ADMIN",
      user: updatedUser
    });

  } catch (error) {
    console.error("Debug user promotion error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}