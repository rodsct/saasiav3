import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking user session...");
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("❌ No session found");
      return NextResponse.json({ 
        user: null,
        authenticated: false 
      });
    }

    console.log(`✅ Session found for: ${session.user.email}`);
    
    return NextResponse.json({
      user: {
        id: (session.user as any).id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        role: (session.user as any).role || "USER",
        subscription: (session.user as any).subscription || "FREE",
        subscriptionEndsAt: (session.user as any).subscriptionEndsAt,
      },
      authenticated: true
    });

  } catch (error) {
    console.error("❌ Session check error:", error);
    return NextResponse.json({ 
      user: null, 
      authenticated: false,
      error: "Session check failed" 
    });
  }
}