import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { sendWelcomeEmail, sendEmailVerification } from "@/utils/emailService";
import { buildUrl } from "@/utils/siteConfig";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { emailType } = await request.json();
    const userId = params.id;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let success = false;
    let message = "";

    switch (emailType) {
      case "welcome":
        success = await sendWelcomeEmail(user.email, user.name || "Usuario");
        message = success ? "Welcome email sent successfully" : "Failed to send welcome email";
        break;

      case "verification":
        // Generate a verification URL (you might want to implement a proper token system)
        const verificationUrl = buildUrl(`/verify-email?email=${encodeURIComponent(user.email)}`);
        success = await sendEmailVerification(user.email, verificationUrl, user.name || "Usuario");
        message = success ? "Verification email sent successfully" : "Failed to send verification email";
        break;

      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message,
        sentTo: user.email 
      });
    } else {
      return NextResponse.json({ 
        error: message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Send test email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}