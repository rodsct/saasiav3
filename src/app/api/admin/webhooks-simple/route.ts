import { NextRequest, NextResponse } from "next/server";
import { CHATBOT_MODELS } from "@/utils/chatbotModels";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: NextRequest) {
  try {
    console.log("Simple webhooks API called");
    
    // Simple auth check - just verify rodsct@gmail.com exists and is ADMIN
    const adminEmail = "rodsct@gmail.com";
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { role: true }
    });
    
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    console.log("Loading webhook models");
    return NextResponse.json({ 
      models: Object.values(CHATBOT_MODELS)
    });

  } catch (error) {
    console.error("Simple webhooks GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log("Simple webhooks PATCH called");
    
    // Simple auth check - just verify rodsct@gmail.com exists and is ADMIN
    const adminEmail = "rodsct@gmail.com";
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { role: true }
    });
    
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { modelId, webhookUrl } = await request.json();

    if (!modelId || !webhookUrl) {
      return NextResponse.json(
        { error: "Model ID and webhook URL are required" },
        { status: 400 }
      );
    }

    if (!CHATBOT_MODELS[modelId]) {
      return NextResponse.json(
        { error: "Invalid model ID" },
        { status: 400 }
      );
    }

    console.log("Updating webhook for model:", modelId, "URL:", webhookUrl);

    // Update the webhook URL in the models configuration
    CHATBOT_MODELS[modelId].webhookUrl = webhookUrl;

    console.log("Webhook updated successfully");
    return NextResponse.json({ 
      success: true,
      message: "Webhook configuration updated",
      model: modelId,
      webhookUrl
    });

  } catch (error) {
    console.error("Simple webhooks PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}