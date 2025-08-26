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

    // Get real user ID from NextAuth session cookie
    let userId = "anonymous-user";
    let realUser = null;
    
    try {
      // Try to extract user from NextAuth session cookie
      const sessionCookie = request.cookies.get("next-auth.session-token")?.value || 
                           request.cookies.get("__Secure-next-auth.session-token")?.value;
      
      if (sessionCookie) {
        console.log("Session cookie found, looking up user");
        // Find session in database
        const session = await prisma.session.findFirst({
          where: { sessionToken: sessionCookie },
          include: { user: true }
        });
        
        if (session?.user) {
          realUser = session.user;
          userId = session.user.id;
          console.log("Real user found:", session.user.email);
        }
      }
      
      // If no session found, create persistent anonymous ID
      if (!realUser) {
        const userAgent = request.headers.get("user-agent") || "unknown";
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        userId = `anon-${Buffer.from(userAgent + ip).toString('base64').slice(0, 8)}`;
        console.log("Using anonymous user ID:", userId);
      }
      
    } catch (error) {
      console.log("Auth lookup failed, using anonymous user");
      userId = `anonymous-${Date.now().toString().slice(-8)}`;
    }

    // Find or create conversation - persist for the same user
    let conversation;
    if (conversationId) {
      // Try to find existing conversation
      conversation = await prisma.conversation.findFirst({
        where: { 
          id: conversationId
        }
      });
    }

    if (!conversation) {
      console.log("Creating new conversation for user:", userId);
      conversation = await prisma.conversation.create({
        data: {
          chatbotId,
          userId: userId, // Use the identified user ID
        }
      });
    }

    // Save user message to maintain history
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        isFromUser: true,
      }
    });

    console.log("User message saved, conversation ID:", conversation.id);

    // Direct webhook call
    const webhookUrl = "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3";
    
    console.log('Sending to webhook with real IDs');
    
    // Call n8n webhook with real conversation and user data
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SaaS-v3-Direct/1.0"
      },
      body: JSON.stringify({
        message,
        conversationId: conversation.id,
        chatbotId,
        userId: userId,
        userEmail: realUser?.email || "anonymous",
        userName: realUser?.name || "Usuario Anónimo",
        userSubscription: realUser?.subscription || "FREE",
        timestamp: new Date().toISOString(),
        messageHistory: await prisma.message.findMany({
          where: { conversationId: conversation.id },
          orderBy: { id: "asc" },
          take: 10, // Last 10 messages for context
          select: {
            content: true,
            isFromUser: true,
            createdAt: true
          }
        })
      }),
    });

    console.log('Webhook response status:', webhookResponse.status);
    
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook error response:', errorText);
      
      // Save error message to conversation
      const botMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: "Lo siento, hubo un problema procesando tu mensaje. El servicio de IA está temporalmente no disponible.",
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

    // Save bot response to database for persistence
    const botMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: n8nResponse.output || n8nResponse.message || n8nResponse.text || "Respuesta procesada correctamente",
        isFromUser: false,
      }
    });

    console.log("Bot message saved with ID:", botMessage.id);

    // Return bot response with real IDs
    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      messageId: botMessage.id,
      content: botMessage.content,
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