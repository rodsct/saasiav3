import { NextRequest, NextResponse } from "next/server";
import { initializeEmailTemplates } from "@/utils/emailTemplates";

export async function GET(request: NextRequest) {
  try {
    console.log("🔧 Initializing email templates via GET endpoint...");
    
    // Initialize email templates
    await initializeEmailTemplates();

    return NextResponse.json({
      success: true,
      message: "Email templates initialized successfully"
    });

  } catch (error) {
    console.error("Initialize email templates error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.toString() },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Initializing email templates via POST endpoint...");
    
    // Initialize email templates
    await initializeEmailTemplates();

    return NextResponse.json({
      success: true,
      message: "Email templates initialized successfully"
    });

  } catch (error) {
    console.error("Initialize email templates error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.toString() },
      { status: 500 }
    );
  }
}