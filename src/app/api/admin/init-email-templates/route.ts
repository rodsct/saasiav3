import { NextRequest, NextResponse } from "next/server";
import { initializeEmailTemplates, checkEmailConfiguration } from "@/utils/initEmailTemplates";

export async function POST(request: NextRequest) {
  try {
    // Simple auth check using headers
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🔧 Initializing email templates via API...');
    
    // Check current configuration
    const beforeConfig = await checkEmailConfiguration();
    
    // Initialize templates
    const success = await initializeEmailTemplates();
    
    // Check configuration after initialization
    const afterConfig = await checkEmailConfiguration();

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Email templates initialized successfully",
        before: beforeConfig,
        after: afterConfig
      });
    } else {
      return NextResponse.json(
        { error: "Failed to initialize email templates" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Init email templates error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simple auth check using headers
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Just check configuration
    const config = await checkEmailConfiguration();

    return NextResponse.json({
      success: true,
      config
    });

  } catch (error) {
    console.error("Check email config error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}