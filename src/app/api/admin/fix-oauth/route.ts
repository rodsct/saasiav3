import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    console.log('🔍 Admin OAuth fix requested by:', user.email);
    
    // Get all OAuth accounts
    const accounts = await prisma.account.findMany({
      where: { type: 'oauth' },
      include: { user: true }
    });

    console.log(`Found ${accounts.length} OAuth accounts`);
    const report = {
      totalAccounts: accounts.length,
      accountsChecked: [],
      fixesApplied: [],
      errors: []
    };

    // Check each account
    for (const acc of accounts) {
      const accountInfo = `${acc.provider} - ${acc.providerAccountId} -> ${acc.user.email}`;
      report.accountsChecked.push(accountInfo);
      console.log(`  ${accountInfo}`);
    }

    // Find the problematic Google account
    const problemAccount = accounts.find(acc => 
      acc.provider === 'google' && 
      acc.providerAccountId === '106703841466023364180' &&
      acc.user.email !== 'automatizacionestumarcaviral@gmail.com'
    );

    if (problemAccount) {
      console.log('❌ Found problematic account linking:');
      const problem = `Google account ${problemAccount.providerAccountId} linked to ${problemAccount.user.email} instead of automatizacionestumarcaviral@gmail.com`;
      
      // Check if correct user exists
      let targetUser = await prisma.user.findUnique({
        where: { email: 'automatizacionestumarcaviral@gmail.com' }
      });

      if (!targetUser) {
        console.log('👤 Creating user for automatizacionestumarcaviral@gmail.com...');
        targetUser = await prisma.user.create({
          data: {
            email: 'automatizacionestumarcaviral@gmail.com',
            name: 'Automatizaciones tumarcaviral',
            emailVerified: new Date(),
            role: 'USER',
            subscription: 'FREE',
          }
        });
        report.fixesApplied.push(`Created user: ${targetUser.email}`);
      }

      // Fix the account linkage
      console.log('🔧 Fixing account linkage...');
      await prisma.account.update({
        where: { id: problemAccount.id },
        data: { userId: targetUser.id }
      });

      const fix = `Fixed Google account ${problemAccount.providerAccountId} to link to ${targetUser.email}`;
      report.fixesApplied.push(fix);
      console.log('✅ Account linkage fixed!');
    } else {
      report.fixesApplied.push('No problematic accounts found');
    }

    // Final verification
    const finalAccounts = await prisma.account.findMany({
      where: { type: 'oauth' },
      include: { user: true }
    });

    report.finalState = finalAccounts.map(acc => 
      `${acc.provider} - ${acc.providerAccountId} -> ${acc.user.email}`
    );

    return NextResponse.json({ 
      success: true, 
      message: "OAuth accounts checked and fixed",
      report 
    });

  } catch (error) {
    console.error('❌ Error fixing OAuth accounts:', error);
    return NextResponse.json({ 
      error: "Failed to fix OAuth accounts",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}