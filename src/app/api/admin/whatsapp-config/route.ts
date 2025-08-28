import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppConfig, updateWhatsAppConfig, initializeWhatsAppConfig } from "@/utils/dbWhatsApp";

// WhatsApp config using database storage for persistence

export async function GET(request: NextRequest) {
  try {
    // Simple auth check using headers
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await getWhatsAppConfig();
    
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

    // Update configuration in database
    const updateSuccess = await updateWhatsAppConfig({
      whatsappNumber,
      whatsappMessage,
      isWhatsappEnabled,
    });

    if (!updateSuccess) {
      return NextResponse.json(
        { error: "Failed to update WhatsApp configuration in database" },
        { status: 500 }
      );
    }

    // Get updated config from database to return
    const updatedConfig = await getWhatsAppConfig();

    return NextResponse.json({ 
      success: true, 
      config: updatedConfig,
      message: "WhatsApp configuration updated successfully in database"
    });

  } catch (error) {
    console.error("Update WhatsApp config error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}