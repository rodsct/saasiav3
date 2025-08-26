import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("Ultra simple chatbot chat API called");
    
    const { chatbotId, message, conversationId } = await request.json();

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Processing message:", message.substring(0, 50) + "...");

    // Create simple persistent IDs without database complexity
    const userAgent = request.headers.get("user-agent") || "unknown";
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const userId = `user-${Buffer.from(userAgent + ip).toString('base64').slice(0, 12)}`;
    
    // Use existing conversation ID or create new one
    const finalConversationId = conversationId || `conv-${userId}-${Date.now()}`;
    
    console.log("Using IDs - User:", userId, "Conversation:", finalConversationId);

    // Direct webhook call without database overhead
    const webhookUrl = "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3";
    
    console.log('Sending directly to webhook:', webhookUrl);
    
    const webhookPayload = {
      message,
      conversationId: finalConversationId,
      chatbotId,
      userId: userId,
      userEmail: "user@example.com", // Will be enhanced later
      userName: "Usuario",
      userSubscription: "PRO",
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