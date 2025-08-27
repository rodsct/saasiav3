import { NextRequest, NextResponse } from "next/server";

// Simplified WhatsApp QR endpoint using only environment variables
// This avoids any database-related issues during migration

export async function GET(request: NextRequest) {
  try {
    // Get configuration from environment variables
    const whatsappNumber = process.env.WHATSAPP_NUMBER || "+5215512345678";
    const whatsappMessage = process.env.WHATSAPP_MESSAGE || "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.";
    const isWhatsappEnabled = process.env.WHATSAPP_ENABLED === 'true' || true; // Default enabled for testing
    
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