import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function POST() {
  try {
    console.log('🔍 Ejecutando limpieza OAuth...');
    
    // Get all OAuth accounts
    const accounts = await prisma.account.findMany({
      where: { type: 'oauth' },
      include: { user: true }
    });

    console.log(`Encontradas ${accounts.length} cuentas OAuth:`);
    accounts.forEach(acc => {
      console.log(`  ${acc.provider} - ${acc.providerAccountId} -> ${acc.user.email}`);
    });

    // Find the problematic Google account
    const problemAccount = accounts.find(acc => 
      acc.provider === 'google' && 
      acc.providerAccountId === '106703841466023364180' &&
      acc.user.email !== 'automatizacionestumarcaviral@gmail.com'
    );

    if (problemAccount) {
      console.log('❌ Cuenta problemática encontrada:');
      console.log(`  Google ${problemAccount.providerAccountId} está vinculada a ${problemAccount.user.email}`);
      
      // Check if correct user exists
      let targetUser = await prisma.user.findUnique({
        where: { email: 'automatizacionestumarcaviral@gmail.com' }
      });

      if (!targetUser) {
        console.log('👤 Creando usuario automatizacionestumarcaviral@gmail.com...');
        targetUser = await prisma.user.create({
          data: {
            email: 'automatizacionestumarcaviral@gmail.com',
            name: 'Automatizaciones tumarcaviral',
            emailVerified: new Date(),
            role: 'USER',
            subscription: 'FREE',
          }
        });
      }

      // Fix the account linkage
      console.log('🔧 Corrigiendo vinculación de cuenta...');
      await prisma.account.update({
        where: { id: problemAccount.id },
        data: { userId: targetUser.id }
      });

      console.log('✅ Vinculación corregida!');
      
      return NextResponse.json({ 
        success: true, 
        message: `Cuenta Google ${problemAccount.providerAccountId} revinculada a ${targetUser.email}`,
        fixed: true
      });
    } else {
      console.log('✅ No se encontraron cuentas problemáticas');
      return NextResponse.json({ 
        success: true, 
        message: "No se encontraron cuentas OAuth problemáticas",
        fixed: false
      });
    }

  } catch (error) {
    console.error('❌ Error ejecutando limpieza OAuth:', error);
    return NextResponse.json({ 
      error: "Error ejecutando limpieza OAuth",
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}