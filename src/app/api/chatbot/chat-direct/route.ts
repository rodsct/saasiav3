import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function POST(request: NextRequest) {
  try {
    console.log("Direct chatbot chat API called");
    
    const { chatbotId, message, conversationId } = await request.json();

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Processing message:", message.substring(0, 50) + "...");

    // Direct webhook call without complex auth checks
    const webhookUrl = "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3";
    
    console.log('Sending directly to webhook:', webhookUrl);
    
    // Call n8n webhook directly
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SaaS-v3-Direct/1.0"
      },
      body: JSON.stringify({
        message,
        conversationId: conversationId || `direct-${Date.now()}`,
        chatbotId,
        userId: "direct-user",
        timestamp: new Date().toISOString()
      }),
    });

    console.log('Webhook response status:', webhookResponse.status);
    
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook error response:', errorText);
      
      return NextResponse.json({
        success: true,
        conversationId: conversationId || `direct-${Date.now()}`,
        messageId: `error-${Date.now()}`,
        content: "Lo siento, hubo un problema procesando tu mensaje. El servicio de IA está temporalmente no disponible.",
      });
    }

    const n8nResponse = await webhookResponse.json();
    console.log('n8n response:', n8nResponse);

    // Return bot response directly
    return NextResponse.json({
      success: true,
      conversationId: conversationId || `direct-${Date.now()}`,
      messageId: `msg-${Date.now()}`,
      content: n8nResponse.output || n8nResponse.message || n8nResponse.text || "Respuesta procesada correctamente",
    });

  } catch (error) {
    console.error("Direct chatbot error:", error);
    
    return NextResponse.json({
      success: true,
      conversationId: `error-${Date.now()}`,
      messageId: `error-${Date.now()}`,
      content: "Lo siento, hubo un error procesando tu mensaje. Intenta más tarde.",
    });
  }
}