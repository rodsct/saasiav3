import { NextRequest, NextResponse } from "next/server";
import { getTempWhatsAppConfig } from "@/utils/tempWhatsAppConfig";

// Simplified WhatsApp QR endpoint using shared in-memory configuration
// This avoids any database-related issues during migration

export async function GET(request: NextRequest) {
  try {
    // Get configuration from shared in-memory storage
    const config = getTempWhatsAppConfig();
    const { whatsappNumber, whatsappMessage, isWhatsappEnabled } = config;
    
    if (!isWhatsappEnabled || !whatsappNumber) {
      return NextResponse.json({ 
        error: "WhatsApp contact not configured" 
      }, { status: 404 });
    }

    // Generate WhatsApp URL
    const message = encodeURIComponent(whatsappMessage);
    const cleanNumber = whatsappNumber.replace(/[+\s-()]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;

    return NextResponse.json({ 
      success: true,
      whatsappUrl,
      whatsappNumber,
      message: whatsappMessage 
    });

  } catch (error) {
    console.error("Get WhatsApp QR error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}