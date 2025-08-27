import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("Ultra simple chatbot chat API called");
    
    const requestBody = await request.json();
    const { chatbotId, message, conversationId, userInfo } = requestBody;

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Processing message:", message.substring(0, 50) + "...");
    
    let userId = "anonymous-user";
    let userEmail = "anonymous@example.com";
    let userName = "Usuario Anónimo";
    let userSubscription = "FREE";
    let userWhatsApp = null;
    
    // If user info is provided from frontend, use it
    if (userInfo?.id) {
      userId = userInfo.id;
      userEmail = userInfo.email || "unknown@example.com";
      userName = userInfo.name || "Usuario";
      userSubscription = userInfo.subscription || "FREE";
      console.log("Using real user info:", userEmail);
      
      // Try to get WhatsApp number from database
      try {
        const { prisma } = await import("@/utils/prismaDB");
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { whatsapp: true }
        });
        userWhatsApp = user?.whatsapp;
        console.log("User WhatsApp:", userWhatsApp);
      } catch (dbError) {
        console.log("Could not fetch WhatsApp from DB:", dbError);
      }
    } else {
      // Fallback: create persistent ID based on browser fingerprint
      const userAgent = request.headers.get("user-agent") || "unknown";
      const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
      userId = `user-${Buffer.from(userAgent + ip).toString('base64').slice(0, 12)}`;
      console.log("Using fallback user ID:", userId);
    }
    
    // Use existing conversation ID or create new one
    const finalConversationId = conversationId || `conv-${userId}-${Date.now()}`;
    
    console.log("Using IDs - User:", userId, "Email:", userEmail, "Conversation:", finalConversationId);

    // Direct webhook call without database overhead
    const webhookUrl = "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3";
    
    console.log('Sending directly to webhook:', webhookUrl);
    
    const webhookPayload = {
      message,
      conversationId: finalConversationId,
      chatbotId,
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      userSubscription: userSubscription,
      userWhatsApp: userWhatsApp,
      timestamp: new Date().toISOString(),
      messageHistory: [] // Empty for now to avoid database issues
    };
    
    console.log("Webhook payload:", JSON.stringify(webhookPayload, null, 2));
    
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SaaS-v3-UltraSimple/1.0"
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log('Webhook response status:', webhookResponse.status);
    console.log('Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()));
    
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook error response:', errorText);
      
      return NextResponse.json({
        success: true,
        conversationId: finalConversationId,
        messageId: `error-${Date.now()}`,
        content: "Lo siento, hubo un problema procesando tu mensaje. El servicio de IA está temporalmente no disponible.",
      });
    }

    let n8nResponse;
    try {
      n8nResponse = await webhookResponse.json();
      console.log('n8n JSON response:', n8nResponse);
    } catch (jsonError) {
      const textResponse = await webhookResponse.text();
      console.log('n8n text response:', textResponse);
      n8nResponse = { output: textResponse };
    }

    const responseContent = n8nResponse.output || n8nResponse.message || n8nResponse.text || n8nResponse.response || "Respuesta procesada correctamente";

    console.log("Final response content:", responseContent);

    // Save conversation and messages to database if user is authenticated
    if (userInfo?.id) {
      try {
        const { prisma } = await import("@/utils/prismaDB");
        
        let dbConversation;
        
        if (conversationId) {
          // Try to find existing conversation
          dbConversation = await prisma.conversation.findUnique({
            where: { 
              id: conversationId,
              userId: userInfo.id 
            },
          });
        }
        
        // Create new conversation if it doesn't exist
        if (!dbConversation) {
          dbConversation = await prisma.conversation.create({
            data: {
              id: finalConversationId,
              chatbotId,
              userId: userInfo.id,
            },
          });
          console.log("Created new conversation:", dbConversation.id);
        }
        
        // Save user message
        await prisma.message.create({
          data: {
            conversationId: dbConversation.id,
            content: message,
            isFromUser: true,
          },
        });
        
        // Save bot response
        await prisma.message.create({
          data: {
            conversationId: dbConversation.id,
            content: responseContent,
            isFromUser: false,
          },
        });
        
        console.log("Messages saved to database for conversation:", dbConversation.id);
        
      } catch (dbError) {
        console.error("Error saving to database:", dbError);
        // Continue without saving - don't break the chat
      }
    }

    return NextResponse.json({
      success: true,
      conversationId: finalConversationId,
      messageId: `msg-${Date.now()}`,
      content: responseContent,
    });

  } catch (error) {
    console.error("Ultra simple chatbot error:", error);
    
    return NextResponse.json({
      success: true,
      conversationId: `error-conv-${Date.now()}`,
      messageId: `error-${Date.now()}`,
      content: "Lo siento, hubo un error interno. El equipo técnico ha sido notificado.",
    });
  }
}