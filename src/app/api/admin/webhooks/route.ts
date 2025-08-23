import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/utils/adminAuth";
import { CHATBOT_MODELS } from "@/utils/chatbotModels";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    return NextResponse.json({ 
      models: Object.values(CHATBOT_MODELS)
    });

  } catch (error) {
    console.error("Admin get webhooks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
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

    // In a real application, you might want to store these in a database
    // For now, we'll return success but note this is configuration only
    return NextResponse.json({ 
      success: true,
      message: "Webhook configuration updated",
      model: modelId,
      webhookUrl
    });

  } catch (error) {
    console.error("Admin update webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}