import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: NextRequest) {
  try {
    console.log("User chatbot endpoint called");
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    console.log("Looking for chatbot for user:", userId);

    // Find existing chatbot for user or create one
    let chatbot = await prisma.chatbot.findFirst({
      where: { 
        userId: userId,
        isActive: true
      }
    });

    console.log("Found existing chatbot:", !!chatbot);

    if (!chatbot) {
      console.log("Creating new chatbot for user:", userId);
      
      // Get user info for chatbot name
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      // Create default chatbot for user
      chatbot = await prisma.chatbot.create({
        data: {
          name: `${user?.name || 'Usuario'} - Asistente Personal`,
          description: "Asistente personal de Aranza.io",
          model: "MODEL_A",
          userId: userId,
          isActive: true,
        }
      });
      console.log("Created chatbot:", chatbot.id);
    }

    return NextResponse.json({ chatbot });

  } catch (error) {
    console.error("Get user chatbot error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}