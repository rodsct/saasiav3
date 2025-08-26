import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Webhook test endpoint - use POST method to test",
    webhook_url: "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3",
    usage: "POST with JSON body: { message: 'test' }"
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log("Testing n8n webhook directly");
    
    const { message = "Test message from SaaS v3" } = await request.json();
    
    const webhookUrl = "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3";
    
    console.log("Sending test message to:", webhookUrl);
    console.log("Test message:", message);
    
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SaaS-v3-Test/1.0"
      },
      body: JSON.stringify({
        message,
        conversationId: "test-conversation",
        chatbotId: "test-chatbot",
        userId: "test-user",
        timestamp: new Date().toISOString()
      }),
    });

    console.log("Webhook response status:", webhookResponse.status);
    console.log("Webhook response headers:", Object.fromEntries(webhookResponse.headers.entries()));
    
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error("Webhook error response:", errorText);
      
      return NextResponse.json({
        success: false,
        error: `Webhook failed: ${webhookResponse.status}`,
        response: errorText,
        url: webhookUrl
      });
    }

    let responseData;
    const contentType = webhookResponse.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      responseData = await webhookResponse.json();
    } else {
      responseData = await webhookResponse.text();
    }
    
    console.log("Webhook success response:", responseData);

    return NextResponse.json({
      success: true,
      webhookUrl,
      status: webhookResponse.status,
      contentType,
      response: responseData
    });

  } catch (error) {
    console.error("Webhook test error:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Unknown error",
      webhookUrl: "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3"
    }, { status: 500 });
  }
}