import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { getAuthenticatedUser } from "@/utils/jwtAuth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatbots = await prisma.chatbot.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ chatbots });

  } catch (error) {
    console.error("Get chatbots error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, model } = await request.json();

    if (!name || !model) {
      return NextResponse.json(
        { error: "Name and model are required" },
        { status: 400 }
      );
    }

    const validModels = ["MODEL_A", "MODEL_B", "MODEL_C"];
    if (!validModels.includes(model)) {
      return NextResponse.json(
        { error: "Invalid model selection" },
        { status: 400 }
      );
    }

    const chatbot = await prisma.chatbot.create({
      data: {
        name,
        description,
        model,
        userId: user.id,
      }
    });

    return NextResponse.json({ chatbot });

  } catch (error) {
    console.error("Create chatbot error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}