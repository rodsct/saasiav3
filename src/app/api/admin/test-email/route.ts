import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail } from "@/utils/emailService";

export async function POST(request: NextRequest) {
  try {
    // Simple auth check using headers
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Send test email
    const success = await sendTestEmail(to);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully"
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send test email. Please check your email configuration." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Send test email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}