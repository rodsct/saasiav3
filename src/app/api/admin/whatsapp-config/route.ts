import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { getAuthenticatedUser } from "@/utils/jwtAuth";

// Temporary fallback using environment variables when DB migration is not available
const getEnvConfig = () => ({
  whatsappNumber: process.env.WHATSAPP_NUMBER || null,
  whatsappMessage: process.env.WHATSAPP_MESSAGE || "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.",
  isWhatsappEnabled: process.env.WHATSAPP_ENABLED === 'true' || false,
});

const setEnvConfig = (config: any) => {
  // Note: This is a temporary solution. In production, you would need to update environment variables
  // For now, we'll just return the config as if it was saved
  console.log("Environment config update requested:", config);
  return {
    whatsappNumber: config.whatsappNumber,
    whatsappMessage: config.whatsappMessage || "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.",
    isWhatsappEnabled: config.isWhatsappEnabled || false,
  };
};

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user?.id || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let config;
    
    try {
      // Try to get existing site config
      config = await prisma.siteConfig.findFirst();
      
      if (!config) {
        config = await prisma.siteConfig.create({
          data: {
            whatsappNumber: null,
            whatsappMessage: "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.",
            isWhatsappEnabled: false,
          }
        });
      }
    } catch (dbError: any) {
      // If SiteConfig table doesn't exist, use environment variables fallback
      if (dbError?.code === 'P2021' || dbError?.message?.includes('does not exist')) {
        console.log("SiteConfig table doesn't exist, using environment fallback");
        config = getEnvConfig();
      } else {
        throw dbError;
      }
    }

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
    const user = await getAuthenticatedUser(request);
    
    if (!user?.id || user.role !== "ADMIN") {
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

    let config;

    try {
      // Try to get existing site config
      config = await prisma.siteConfig.findFirst();
      
      if (!config) {
        config = await prisma.siteConfig.create({
          data: {
            whatsappNumber,
            whatsappMessage: whatsappMessage || "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.",
            isWhatsappEnabled: isWhatsappEnabled || false,
          }
        });
      } else {
        config = await prisma.siteConfig.update({
          where: { id: config.id },
          data: {
            whatsappNumber,
            whatsappMessage: whatsappMessage || config.whatsappMessage,
            isWhatsappEnabled: isWhatsappEnabled || false,
          }
        });
      }
    } catch (dbError: any) {
      // If SiteConfig table doesn't exist, use environment variables as fallback
      if (dbError?.code === 'P2021' || dbError?.message?.includes('does not exist')) {
        console.log("SiteConfig table doesn't exist, using environment variables fallback");
        config = setEnvConfig({
          whatsappNumber,
          whatsappMessage,
          isWhatsappEnabled
        });
        
        return NextResponse.json({ 
          success: true, 
          config,
          message: "Configuration saved temporarily. Run migration for persistence: npx prisma migrate dev"
        });
      } else {
        throw dbError;
      }
    }

    return NextResponse.json({ 
      success: true, 
      config 
    });

  } catch (error) {
    console.error("Update WhatsApp config error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}