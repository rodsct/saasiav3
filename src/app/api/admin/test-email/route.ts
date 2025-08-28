import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail } from "@/utils/emailService";
import { checkEmailConfiguration, initializeEmailTemplates } from "@/utils/initEmailTemplates";

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

    // Check email configuration
    const config = await checkEmailConfiguration();
    
    if (!config.smtpReady) {
      return NextResponse.json(
        { 
          error: "SMTP configuration incomplete", 
          details: `Missing environment variables: ${config.missingVars.join(', ')}`,
          missingVars: config.missingVars
        },
        { status: 500 }
      );
    }

    if (!config.templatesReady) {
      console.log('Email templates not found, initializing...');
      await initializeEmailTemplates();
    }

    console.log('🧪 Starting test email process for:', to);
    console.log('📋 Configuration status:', config);
    
    // Send test email
    const success = await sendTestEmail(to);

    if (success) {
      console.log('✅ Test email sent successfully to:', to);
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully",
        config: {
          templatesReady: config.templatesReady,
          smtpReady: config.smtpReady
        }
      });
    } else {
      console.error('❌ Test email failed for:', to);
      return NextResponse.json(
        { 
          error: "Failed to send test email. Please check your email configuration.",
          config: {
            templatesReady: config.templatesReady,
            smtpReady: config.smtpReady,
            missingVars: config.missingVars
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Send test email error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}