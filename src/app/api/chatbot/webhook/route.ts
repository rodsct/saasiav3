import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { getWebhookUrlForModel } from "@/utils/chatbotModels";

export async function POST(request: NextRequest) {
  try {
    const { chatbotId, message, conversationId } = await request.json();

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: { user: true }
    });

    if (!chatbot || !chatbot.isActive) {
      return NextResponse.json(
        { error: "Chatbot not found or inactive" },
        { status: 404 }
      );
    }

    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          chatbotId,
          userId: chatbot.userId,
        }
      });
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        isFromUser: true,
      }
    });

    const webhookUrl = chatbot.n8nWebhookUrl || getWebhookUrlForModel(chatbot.model);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationId: conversation.id,
        chatbotId,
        userId: chatbot.userId,
      }),
    });

    if (!response.ok) {
      throw new Error("n8n webhook failed");
    }

    const n8nResponse = await response.json();

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: n8nResponse.message || "Error processing your request",
        isFromUser: false,
      }
    });

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      response: n8nResponse.message || "Error processing your request",
    });

  } catch (error) {
    console.error("Chatbot webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}