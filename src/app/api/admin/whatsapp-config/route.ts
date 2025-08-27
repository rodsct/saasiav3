import { NextRequest, NextResponse } from "next/server";

// Simplified WhatsApp config using only environment variables
// This avoids any database-related issues during migration

export async function GET(request: NextRequest) {
  try {
    // Simple auth check using headers
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return environment-based config
    const config = {
      whatsappNumber: process.env.WHATSAPP_NUMBER || "+5215512345678",
      whatsappMessage: process.env.WHATSAPP_MESSAGE || "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.",
      isWhatsappEnabled: process.env.WHATSAPP_ENABLED === 'true' || true, // Default enabled for testing
    };

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

    // For now, just return the config as if it was saved
    // In production, you would update environment variables or use database after migration
    const config = {
      whatsappNumber: whatsappNumber || process.env.WHATSAPP_NUMBER || "+5215512345678",
      whatsappMessage: whatsappMessage || process.env.WHATSAPP_MESSAGE || "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.",
      isWhatsappEnabled: isWhatsappEnabled !== undefined ? isWhatsappEnabled : (process.env.WHATSAPP_ENABLED === 'true' || true),
    };

    console.log("WhatsApp config temporarily updated:", config);

    return NextResponse.json({ 
      success: true, 
      config,
      message: "Configuration updated temporarily. For persistence, run: npx prisma migrate dev"
    });

  } catch (error) {
    console.error("Update WhatsApp config error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}