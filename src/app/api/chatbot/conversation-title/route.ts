import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { getAuthenticatedUser } from "@/utils/jwtAuth";

// Generate a smart title based on the first user message
function generateConversationTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().slice(0, 50);
  
  // If it's a question, keep it as is
  if (cleaned.includes('?')) {
    return cleaned.length > 40 ? cleaned.slice(0, 40) + '...' : cleaned;
  }
  
  // If it's a long statement, summarize it
  if (cleaned.length > 40) {
    const words = cleaned.split(' ');
    const summary = words.slice(0, 6).join(' ');
    return summary + '...';
  }
  
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID required" },
        { status: 400 }
      );
    }

    // Get the conversation with its first user message
    const conversation = await prisma.conversation.findUnique({
      where: { 
        id: conversationId,
        userId: user.id 
      },
      include: {
        messages: {
          where: { isFromUser: true },
          orderBy: { createdAt: "asc" },
          take: 1
        }
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Generate title from first user message
    const firstUserMessage = conversation.messages[0];
    if (!firstUserMessage) {
      return NextResponse.json(
        { error: "No user messages found in conversation" },
        { status: 400 }
      );
    }

    const title = generateConversationTitle(firstUserMessage.content);

    // Update conversation with generated title
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { title }
    });

    return NextResponse.json({ 
      success: true, 
      title,
      conversation: updatedConversation 
    });

  } catch (error) {
    console.error("Generate conversation title error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, title } = await request.json();

    if (!conversationId || !title) {
      return NextResponse.json(
        { error: "Conversation ID and title required" },
        { status: 400 }
      );
    }

    // Update conversation title
    const updatedConversation = await prisma.conversation.update({
      where: { 
        id: conversationId,
        userId: user.id 
      },
      data: { title: title.slice(0, 100) } // Limit title length
    });

    return NextResponse.json({ 
      success: true, 
      conversation: updatedConversation 
    });

  } catch (error) {
    console.error("Update conversation title error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}