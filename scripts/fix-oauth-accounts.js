const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixOAuthAccounts() {
  try {
    console.log('🔍 Checking current OAuth accounts...');
    
    const accounts = await prisma.account.findMany({
      where: {
        type: 'oauth'
      },
      include: {
        user: true
      }
    });

    console.log(`Found ${accounts.length} OAuth accounts:`);
    accounts.forEach(acc => {
      console.log(`  ${acc.provider} - ${acc.providerAccountId} -> User: ${acc.user.email} (${acc.user.name})`);
    });

    // Find the problematic account where Google providerAccountId 106703841466023364180 
    // is linked to rodsct@gmail.com instead of automatizacionestumarcaviral@gmail.com
    const problemAccount = accounts.find(acc => 
      acc.provider === 'google' && 
      acc.providerAccountId === '106703841466023364180' &&
      acc.user.email !== 'automatizacionestumarcaviral@gmail.com'
    );

    if (problemAccount) {
      console.log('❌ Found problematic account linking:');
      console.log(`  Google account ${problemAccount.providerAccountId} is linked to ${problemAccount.user.email}`);
      console.log(`  But it should be linked to automatizacionestumarcaviral@gmail.com`);
      
      // Check if user automatizacionestumarcaviral@gmail.com exists
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
      }

      // Update the account to point to the correct user
      console.log('🔧 Fixing account linkage...');
      await prisma.account.update({
        where: { id: problemAccount.id },
        data: { userId: targetUser.id }
      });

      console.log('✅ Account linkage fixed!');
    } else {
      console.log('✅ No problematic accounts found');
    }

    // Check for any remaining duplicates or issues
    console.log('\n🔍 Final check of all OAuth accounts:');
    const finalAccounts = await prisma.account.findMany({
      where: { type: 'oauth' },
      include: { user: true }
    });

    finalAccounts.forEach(acc => {
      console.log(`  ${acc.provider} - ${acc.providerAccountId} -> ${acc.user.email} (${acc.user.name})`);
    });

  } catch (error) {
    console.error('❌ Error fixing OAuth accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOAuthAccounts();