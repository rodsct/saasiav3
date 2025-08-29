import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    // For now, we'll just verify the email directly since we don't have a proper token system yet
    const user = await prisma.user.findUnique({
      where: { email: decodeURIComponent(email) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ 
        message: "Email already verified",
        verified: true 
      });
    }

    // Update user email verification
    await prisma.user.update({
      where: { email: decodeURIComponent(email) },
      data: { emailVerified: new Date() }
    });

    return NextResponse.json({ 
      message: "Email verified successfully",
      verified: true 
    });

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // For now, we'll just verify the email directly since we don't have a proper token system yet
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ 
        message: "Email already verified",
        verified: true 
      });
    }

    // Update user email verification
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    });

    return NextResponse.json({ 
      message: "Email verified successfully",
      verified: true 
    });

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}