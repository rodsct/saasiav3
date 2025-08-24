import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const download = await prisma.download.findUnique({
      where: { id }
    });

    if (!download) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    const canAccess = checkDownloadAccess(download.accessLevel, session);
    if (!canAccess) {
      return NextResponse.json(
        { error: "Insufficient permissions to download this file" },
        { status: 403 }
      );
    }

    // Update download count
    await prisma.download.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    });

    // Serve the file
    try {
      const filePath = path.join(process.cwd(), 'public', download.filePath);
      const fileBuffer = await fs.readFile(filePath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': download.mimeType,
          'Content-Disposition': `attachment; filename="${download.fileName}"`,
          'Content-Length': download.fileSize.toString(),
        },
      });
    } catch (fileError) {
      console.error("File read error:", fileError);
      return NextResponse.json(
        { error: "File not found on server" },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error("Download file error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function checkDownloadAccess(accessLevel: string, session: any): boolean {
  // No public downloads - authentication required
  if (!session?.user?.id) {
    return false;
  }
  
  if (accessLevel === "REGISTERED") {
    return true;
  }
  
  if (accessLevel === "PREMIUM") {
    const userSubscription = (session.user as any).subscription || "FREE";
    return userSubscription === "PREMIUM";
  }
  
  return false;
}

// Only admins can delete files - regular users should not have access
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { error: "Only administrators can delete files" },
    { status: 403 }
  );
}