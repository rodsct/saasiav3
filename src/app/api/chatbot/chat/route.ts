import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { getWebhookUrlForModel } from "@/utils/chatbotModels";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { chatbotId, message, conversationId } = await request.json();

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the chatbot
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

    // Find or create conversation
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
          userId: session.user.id,
        }
      });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        isFromUser: true,
      }
    });

    // Get webhook URL
    const webhookUrl = chatbot.n8nWebhookUrl || getWebhookUrlForModel(chatbot.model);
    
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      throw new Error("No valid webhook URL configured");
    }
    
    console.log('Sending to webhook:', webhookUrl);
    
    // Call n8n webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationId: conversation.id,
        chatbotId,
        userId: session.user.id,
      }),
    });

    console.log('Webhook response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`n8n webhook failed: ${response.status} - ${errorText}`);
    }

    const n8nResponse = await response.json();
    console.log('n8n response:', n8nResponse);

    // Save bot response
    const botMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: n8nResponse.output || n8nResponse.message || "Error processing your request",
        isFromUser: false,
      }
    });

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      messageId: botMessage.id,
      content: botMessage.content,
    });

  } catch (error) {
    console.error("Chatbot chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}