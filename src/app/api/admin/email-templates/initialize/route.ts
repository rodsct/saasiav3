import { NextRequest, NextResponse } from "next/server";
import { initializeEmailTemplates } from "@/utils/emailTemplates";

export async function POST(request: NextRequest) {
  try {
    // Simple auth check using headers
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize email templates
    await initializeEmailTemplates();

    return NextResponse.json({
      success: true,
      message: "Email templates initialized successfully"
    });

  } catch (error) {
    console.error("Initialize email templates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}