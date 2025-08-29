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
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            whatsapp: true,
            subscription: true,
            subscriptionEndsAt: true
          }
        }
      }
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
    
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      throw new Error("No valid webhook URL configured");
    }
    
    // Check if user subscription is still active
    const isSubscriptionActive = chatbot.user.subscription === "PRO" && 
      (!chatbot.user.subscriptionEndsAt || new Date() <= new Date(chatbot.user.subscriptionEndsAt));

    const webhookPayload = {
      message,
      conversationId: conversation.id,
      chatbotId,
      userId: chatbot.userId,
      user: {
        id: chatbot.user.id,
        name: chatbot.user.name,
        email: chatbot.user.email,
        whatsapp: chatbot.user.whatsapp,
        subscription: chatbot.user.subscription,
        subscriptionActive: isSubscriptionActive,
        subscriptionEndsAt: chatbot.user.subscriptionEndsAt
      }
    };
    
    console.log('Sending to webhook:', webhookUrl);
    console.log('Payload:', webhookPayload);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('Webhook response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`n8n webhook failed: ${response.status} - ${errorText}`);
    }

    const n8nResponse = await response.json();
    console.log('n8n response:', n8nResponse);

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: n8nResponse.output || n8nResponse.message || "Error processing your request",
        isFromUser: false,
      }
    });

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      response: n8nResponse.output || n8nResponse.message || "Error processing your request",
    });

  } catch (error) {
    console.error("Chatbot webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}