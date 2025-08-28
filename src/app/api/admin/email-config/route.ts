import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Simple auth check using headers
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check SMTP environment variables
    const config = {
      EMAIL_SERVER_HOST: !!process.env.EMAIL_SERVER_HOST,
      EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT || '587',
      EMAIL_SERVER_USER: !!process.env.EMAIL_SERVER_USER,
      EMAIL_SERVER_PASSWORD: !!process.env.EMAIL_SERVER_PASSWORD,
    };

    const values = {
      EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST || 'Not set',
      EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT || '587',
      EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER || 'Not set',
      EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD ? '***set***' : 'Not set',
    };

    const missingVars = Object.entries(config)
      .filter(([key, value]) => key !== 'EMAIL_SERVER_PORT' && !value)
      .map(([key]) => key);

    const isReady = missingVars.length === 0;

    return NextResponse.json({
      success: true,
      isReady,
      config,
      values,
      missingVars,
      message: isReady ? 'SMTP configuration is complete' : `Missing: ${missingVars.join(', ')}`
    });

  } catch (error) {
    console.error("Email config check error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}