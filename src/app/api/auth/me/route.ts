import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 /api/auth/me - Checking session...");
    
    const session = await getServerSession(authOptions);
    
    console.log(`📋 Session found: ${session ? 'YES' : 'NO'}, User: ${session?.user?.email || 'N/A'}`);

    if (!session || !session.user) {
      console.log("❌ No session found");
      return NextResponse.json({ user: null });
    }

    console.log(`✅ Returning user session for: ${session.user.email}`);
    return NextResponse.json({
      user: {
        id: (session.user as any).id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        subscription: (session.user as any).subscription,
        role: (session.user as any).role,
      }
    });

  } catch (error) {
    console.error("❌ Auth check error:", error);
    return NextResponse.json({ user: null });
  }
}