const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOAuthAccounts() {
  try {
    console.log('🧹 Cleaning up incorrect OAuth account linkings...');
    
    // Get all accounts that are linked to the wrong user
    const accounts = await prisma.account.findMany({
      include: {
        user: true
      }
    });

    console.log(`Found ${accounts.length} OAuth accounts`);

    // Delete accounts that are linked to wrong users based on email mismatch
    for (const account of accounts) {
      if (account.type === 'oauth' && account.user.email) {
        // For Google accounts, the providerAccountId should match sub claim
        console.log(`Checking account: ${account.provider} - ${account.providerAccountId} -> ${account.user.email}`);
      }
    }

    // Clean up duplicate accounts for the same provider+providerAccountId
    console.log('🔍 Looking for duplicate OAuth accounts...');
    
    const duplicates = await prisma.account.groupBy({
      by: ['provider', 'providerAccountId'],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    console.log(`Found ${duplicates.length} duplicate account combinations`);

    for (const duplicate of duplicates) {
      const accounts = await prisma.account.findMany({
        where: {
          provider: duplicate.provider,
          providerAccountId: duplicate.providerAccountId,
        },
        orderBy: {
          id: 'desc', // Keep the most recent one
        },
      });

      // Delete all but the first (most recent) account
      for (let i = 1; i < accounts.length; i++) {
        console.log(`Deleting duplicate account: ${accounts[i].provider} - ${accounts[i].providerAccountId}`);
        await prisma.account.delete({
          where: { id: accounts[i].id }
        });
      }
    }

    console.log('✅ OAuth cleanup completed');
  } catch (error) {
    console.error('❌ Error during OAuth cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOAuthAccounts();