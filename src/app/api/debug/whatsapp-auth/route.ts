import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 WhatsApp Debug - Starting authentication check");
    
    // Get session using proper NextAuth method
    const session = await getServerSession(authOptions);
    console.log("🔍 Session object:", session);
    
    if (!session) {
      console.log("❌ No session found");
      return NextResponse.json({
        error: "No session found",
        debug: {
          session: null,
          authOptions: "configured",
          timestamp: new Date().toISOString()
        }
      }, { status: 401 });
    }

    if (!session?.user?.email) {
      console.log("❌ Session found but no user email");
      return NextResponse.json({
        error: "No user email in session",
        debug: {
          session: !!session,
          user: !!session.user,
          email: !!session?.user?.email,
          timestamp: new Date().toISOString()
        }
      }, { status: 401 });
    }

    console.log("✅ Session valid, user email:", session.user.email);

    // Try to find user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        email: true,
        name: true,
        whatsapp: true,
        subscription: true,
        subscriptionEndsAt: true
      }
    });

    console.log("🔍 User from database:", user);

    if (!user) {
      return NextResponse.json({
        error: "User not found in database",
        debug: {
          sessionEmail: session.user.email,
          userFound: false,
          timestamp: new Date().toISOString()
        }
      }, { status: 404 });
    }

    const body = await request.json();
    const { whatsapp } = body;
    
    console.log("🔍 WhatsApp number to save:", whatsapp);

    // Simple phone validation
    if (!whatsapp || typeof whatsapp !== 'string') {
      return NextResponse.json({
        error: "Valid WhatsApp number is required",
        debug: {
          whatsapp: whatsapp,
          type: typeof whatsapp,
          timestamp: new Date().toISOString()
        }
      }, { status: 400 });
    }

    // Update user's WhatsApp number
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { whatsapp: whatsapp.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        subscription: true
      },
    });

    console.log("✅ WhatsApp updated successfully:", updatedUser);

    return NextResponse.json({
      success: true,
      message: "WhatsApp number updated successfully",
      user: updatedUser,
      debug: {
        sessionEmail: session.user.email,
        userId: updatedUser.id,
        whatsapp: updatedUser.whatsapp,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("💥 WhatsApp debug error:", error);
    return NextResponse.json({
      error: "Internal server error",
      debug: {
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : null,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 WhatsApp Debug GET - Starting session check");
    
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      email: session?.user?.email || null,
      name: session?.user?.name || null,
      timestamp: new Date().toISOString(),
      authOptions: "configured"
    });

  } catch (error) {
    console.error("💥 WhatsApp debug GET error:", error);
    return NextResponse.json({
      error: "Internal server error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}