import { NextRequest, NextResponse } from "next/server";
import { getTempWhatsAppConfig, setTempWhatsAppConfig } from "@/utils/tempWhatsAppConfig";

// Simplified WhatsApp config using shared in-memory storage
// This avoids any database-related issues during migration

export async function GET(request: NextRequest) {
  try {
    // Simple auth check using headers
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = getTempWhatsAppConfig();
    
    return NextResponse.json({ 
      success: true, 
      config
    });

  } catch (error) {
    console.error("Get WhatsApp config error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Simple auth check using headers
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { whatsappNumber, whatsappMessage, isWhatsappEnabled } = await request.json();

    if (!whatsappNumber && isWhatsappEnabled) {
      return NextResponse.json(
        { error: "WhatsApp number is required when enabling" },
        { status: 400 }
      );
    }

    // Validate WhatsApp number format if provided
    if (whatsappNumber && !whatsappNumber.match(/^\+\d{10,15}$/)) {
      return NextResponse.json(
        { error: "Invalid WhatsApp number format. Use +[country][number] (e.g., +5212345678901)" },
        { status: 400 }
      );
    }

    // Update the shared in-memory configuration
    const updatedConfig = setTempWhatsAppConfig({
      whatsappNumber,
      whatsappMessage,
      isWhatsappEnabled,
    });

    return NextResponse.json({ 
      success: true, 
      config: updatedConfig,
      message: "Configuration updated temporarily in memory. For persistence, run: npx prisma migrate dev"
    });

  } catch (error) {
    console.error("Update WhatsApp config error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}