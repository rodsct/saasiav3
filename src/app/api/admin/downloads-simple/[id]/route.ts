import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("Simple admin downloads DELETE called");
    
    // Simple auth check - just verify rodsct@gmail.com exists and is ADMIN
    const adminEmail = "rodsct@gmail.com";
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true, role: true }
    });
    
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Get download info before deleting
    const download = await prisma.download.findUnique({
      where: { id },
      select: { filePath: true, title: true }
    });

    if (!download) {
      return NextResponse.json(
        { error: "Download not found" },
        { status: 404 }
      );
    }

    console.log("Deleting download:", download.title);

    // Delete from database
    await prisma.download.delete({
      where: { id }
    });

    // Try to delete file from filesystem (optional - don't fail if file doesn't exist)
    try {
      const filePath = path.join(process.cwd(), 'public', download.filePath);
      await fs.unlink(filePath);
      console.log("File deleted from filesystem:", download.filePath);
    } catch (fileError) {
      console.log("File not found on filesystem (already deleted?):", download.filePath);
      // Don't fail if file doesn't exist
    }

    console.log("Download deleted successfully");
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Simple admin delete download error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}