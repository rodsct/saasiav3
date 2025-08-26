import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { getWebhookUrlForModel } from "@/utils/chatbotModels";

export async function POST(request: NextRequest) {
  try {
    console.log("Simple chatbot chat API called");
    
    const { chatbotId, message, conversationId } = await request.json();

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Processing chat message for chatbot:", chatbotId);

    // Find the chatbot - simplified check
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      select: { 
        id: true, 
        model: true, 
        isActive: true, 
        n8nWebhookUrl: true,
        userId: true
      }
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
      console.log("Creating new conversation");
      conversation = await prisma.conversation.create({
        data: {
          chatbotId,
          userId: chatbot.userId, // Use chatbot owner for now
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

    console.log("User message saved, sending to webhook");

    // Get webhook URL
    const webhookUrl = chatbot.n8nWebhookUrl || getWebhookUrlForModel(chatbot.model);
    
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      throw new Error("No valid webhook URL configured");
    }
    
    console.log('Sending to webhook:', webhookUrl);
    
    // Call n8n webhook
    const webhookResponse = await fetch(webhookUrl, {
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

    console.log('Webhook response status:', webhookResponse.status);
    
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook error response:', errorText);
      
      // Save error message
      const botMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: "Lo siento, hubo un error procesando tu mensaje. Intenta más tarde.",
          isFromUser: false,
        }
      });

      return NextResponse.json({
        success: true,
        conversationId: conversation.id,
        messageId: botMessage.id,
        content: botMessage.content,
      });
    }

    const n8nResponse = await webhookResponse.json();
    console.log('n8n response:', n8nResponse);

    // Save bot response
    const botMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: n8nResponse.output || n8nResponse.message || "Respuesta procesada correctamente",
        isFromUser: false,
      }
    });

    console.log("Bot message saved successfully");

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      messageId: botMessage.id,
      content: botMessage.content,
    });

  } catch (error) {
    console.error("Simple chatbot chat error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}