import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: NextRequest) {
  try {
    console.log("Simple chatbot conversations API called");
    
    const { searchParams } = new URL(request.url);
    const chatbotId = searchParams.get("chatbotId");

    if (!chatbotId) {
      return NextResponse.json(
        { error: "Chatbot ID required" },
        { status: 400 }
      );
    }

    console.log("Loading conversations for chatbot:", chatbotId);

    // For now, simplified - just get conversations without strict user checks
    // You can enhance this later with proper auth
    const conversations = await prisma.conversation.findMany({
      where: {
        chatbotId,
      },
      include: {
        messages: {
          orderBy: { id: "asc" }
        }
      },
      orderBy: { id: "desc" }
    });

    console.log("Conversations loaded:", conversations.length);
    return NextResponse.json({ conversations });

  } catch (error) {
    console.error("Simple chatbot conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}