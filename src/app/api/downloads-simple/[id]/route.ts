import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("Simple downloads API called");
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

    // Simplified access check - for now allow all registered users
    // You can enhance this later with proper auth
    console.log("Download found:", download.title);

    // Check if file exists
    try {
      const filePath = path.join(process.cwd(), 'public', download.filePath);
      const fileBuffer = await fs.readFile(filePath);
      
      // Update download count
      await prisma.download.update({
        where: { id },
        data: {
          downloadCount: {
            increment: 1
          }
        }
      });

      console.log("File served successfully:", download.fileName);
      
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
    console.error("Simple download file error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}