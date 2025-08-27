import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { getAuthenticatedUser } from "@/utils/jwtAuth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find existing chatbot for user or create one
    let chatbot = await prisma.chatbot.findFirst({
      where: { 
        userId: user.id,
        isActive: true
      }
    });

    if (!chatbot) {
      // Create default chatbot for user
      chatbot = await prisma.chatbot.create({
        data: {
          name: `${user.name || 'Usuario'} - Asistente Personal`,
          description: "Asistente personal de Aranza.io",
          model: "MODEL_A",
          userId: user.id,
          isActive: true,
        }
      });
    }

    return NextResponse.json({ chatbot });

  } catch (error) {
    console.error("Get user chatbot error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}