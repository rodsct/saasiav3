import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: NextRequest) {
  try {
    let config;
    
    try {
      // Try to get existing site config
      config = await prisma.siteConfig.findFirst();
    } catch (dbError: any) {
      // If SiteConfig table doesn't exist, return not configured
      if (dbError?.code === 'P2021' || dbError?.message?.includes('does not exist')) {
        console.log("SiteConfig table doesn't exist, WhatsApp not configured");
        return NextResponse.json({ 
          error: "WhatsApp contact not configured" 
        }, { status: 404 });
      } else {
        throw dbError;
      }
    }
    
    if (!config || !config.isWhatsappEnabled || !config.whatsappNumber) {
      return NextResponse.json({ 
        error: "WhatsApp contact not configured" 
      }, { status: 404 });
    }

    // Generate WhatsApp URL
    const message = encodeURIComponent(
      config.whatsappMessage || 
      "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones."
    );
    
    const whatsappUrl = `https://wa.me/${config.whatsappNumber.replace('+', '')}?text=${message}`;

    return NextResponse.json({ 
      success: true,
      whatsappUrl,
      whatsappNumber: config.whatsappNumber,
      message: config.whatsappMessage 
    });

  } catch (error) {
    console.error("Get WhatsApp QR error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}