import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatbots = await prisma.chatbot.findMany({
      where: { userId: session.user.id },
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, n8nWebhookUrl } = await request.json();

    if (!name || !n8nWebhookUrl) {
      return NextResponse.json(
        { error: "Name and webhook URL are required" },
        { status: 400 }
      );
    }

    const chatbot = await prisma.chatbot.create({
      data: {
        name,
        description,
        n8nWebhookUrl,
        userId: session.user.id,
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