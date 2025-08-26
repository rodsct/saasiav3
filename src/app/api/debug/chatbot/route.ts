import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/jwtAuth";
import { prisma } from "@/utils/prismaDB";

const DEFAULT_CHATBOT_ID = "cmepuxaoj0004kndw8g42uma8";

export async function GET(request: NextRequest) {
  try {
    console.log("Debug chatbot API called");
    
    const user = await getAuthenticatedUser(request);
    console.log("Authenticated user:", user);
    
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if the default chatbot exists
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: DEFAULT_CHATBOT_ID }
    });

    console.log("Default chatbot exists:", !!chatbot);

    // Get chatbots for this user
    const userChatbots = await prisma.chatbot.findMany({
      where: { userId: user.id }
    });

    console.log("User chatbots count:", userChatbots.length);

    return NextResponse.json({ 
      defaultChatbotExists: !!chatbot,
      defaultChatbotId: DEFAULT_CHATBOT_ID,
      chatbot: chatbot,
      userChatbots: userChatbots,
      userId: user.id
    });

  } catch (error) {
    console.error("Debug chatbot API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Debug chatbot creation API called");
    
    const user = await getAuthenticatedUser(request);
    console.log("Authenticated user:", user);
    
    if (!user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Create the default chatbot for the user
    const chatbot = await prisma.chatbot.create({
      data: {
        id: DEFAULT_CHATBOT_ID,
        name: "Default Chatbot",
        description: "Default chatbot for conversations",
        userId: user.id,
        webhookUrl: process.env.DEFAULT_N8N_WEBHOOK || "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3",
        isActive: true,
      }
    });

    console.log("Default chatbot created:", chatbot);

    return NextResponse.json({ 
      success: true,
      message: "Default chatbot created",
      chatbot: chatbot
    });

  } catch (error) {
    console.error("Debug chatbot creation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}