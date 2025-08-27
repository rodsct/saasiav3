import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function POST(request: NextRequest) {
  try {
    console.log("WhatsApp Simple POST API called");
    
    const body = await request.json();
    const { whatsapp, userEmail } = body;
    
    // Use rodsct@gmail.com as default for testing
    const email = userEmail || "rodsct@gmail.com";
    
    console.log("Processing WhatsApp for email:", email);
    console.log("WhatsApp number:", whatsapp);
    
    if (!whatsapp || typeof whatsapp !== 'string') {
      return NextResponse.json(
        { error: "Valid WhatsApp number is required" },
        { status: 400 }
      );
    }

    // Validate WhatsApp number format (basic validation)
    const cleanWhatsApp = whatsapp.replace(/\D/g, '');
    if (cleanWhatsApp.length < 10 || cleanWhatsApp.length > 15) {
      return NextResponse.json(
        { error: "Please enter a valid WhatsApp number with country code" },
        { status: 400 }
      );
    }

    // Get user and verify they exist
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true, subscription: true, role: true, name: true }
    });

    console.log("User found:", user);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.subscription !== "PRO") {
      return NextResponse.json(
        { error: "PRO subscription required for WhatsApp integration" },
        { status: 403 }
      );
    }

    const formattedWhatsApp = `+${cleanWhatsApp}`;
    console.log("Formatted WhatsApp:", formattedWhatsApp);

    // Update user's WhatsApp number
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { whatsapp: formattedWhatsApp },
      select: { id: true, email: true, name: true, whatsapp: true }
    });

    console.log("User updated:", updatedUser);

    // Send WhatsApp info to n8n webhook
    try {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3";
      
      const webhookData = {
        action: "whatsapp_setup",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          whatsapp: updatedUser.whatsapp
        },
        timestamp: new Date().toISOString()
      };

      console.log("Sending to n8n webhook:", webhookData);

      const webhookResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      });

      console.log("n8n webhook response status:", webhookResponse.status);
      
      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error("n8n webhook failed:", errorText);
      } else {
        console.log("n8n webhook success");
      }
    } catch (webhookError) {
      console.error("Error sending to n8n webhook:", webhookError);
      // Don't fail the main operation if webhook fails
    }

    console.log("WhatsApp setup successful");
    return NextResponse.json({
      success: true,
      message: "WhatsApp number updated successfully",
      whatsapp: updatedUser.whatsapp
    });

  } catch (error) {
    console.error("WhatsApp update error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("WhatsApp Simple GET API called");
    
    // Use rodsct@gmail.com as default for testing
    const email = "rodsct@gmail.com";
    console.log("Fetching WhatsApp for email:", email);

    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { whatsapp: true, subscription: true }
    });

    console.log("User found in GET:", user);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      whatsapp: user.whatsapp || null,
      isPro: user.subscription === "PRO"
    });

  } catch (error) {
    console.error("WhatsApp fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}