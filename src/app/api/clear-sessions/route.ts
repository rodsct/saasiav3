import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function GET() {
  return NextResponse.json({ 
    message: "Use POST method to clear all sessions",
    endpoint: "/api/clear-sessions",
    method: "POST"
  });
}

export async function POST() {
  try {
    console.log('🧹 Limpiando todas las sesiones activas...');
    
    // Delete all active sessions
    const deletedSessions = await prisma.session.deleteMany({});
    
    console.log(`✅ ${deletedSessions.count} sesiones eliminadas`);
    
    // Also check current sessions after deletion
    const remainingSessions = await prisma.session.findMany({
      include: { user: true }
    });
    
    console.log(`📊 Sesiones restantes: ${remainingSessions.length}`);
    remainingSessions.forEach(session => {
      console.log(`  - Sesión ${session.id} -> ${session.user.email}`);
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `${deletedSessions.count} sesiones eliminadas correctamente`,
      remainingSessions: remainingSessions.length
    });

  } catch (error) {
    console.error('❌ Error limpiando sesiones:', error);
    return NextResponse.json({ 
      error: "Error limpiando sesiones",
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}