import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prismaDB";
import { NextRequest, NextResponse } from "next/server";

export async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true }
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function requireAdmin(request: NextRequest) {
  const admin = await checkAdminAuth();
  
  if (!admin) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  return admin;
}