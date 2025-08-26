import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

// EMERGENCY endpoint to promote rodsct@gmail.com to ADMIN
// This should be removed after use

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Emergency promotion of rodsct@gmail.com to ADMIN...');
    
    // Update user to ADMIN with PRO subscription
    const updatedUser = await prisma.user.update({
      where: { email: 'rodsct@gmail.com' },
      data: {
        role: 'ADMIN',
        subscription: 'PRO',
        subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      }
    });

    console.log('✅ User promoted successfully!');
    console.log('👤 User:', updatedUser.email);
    console.log('🔐 Role:', updatedUser.role);
    console.log('💎 Subscription:', updatedUser.subscription);
    console.log('📅 Expires:', updatedUser.subscriptionEndsAt);
    
    return NextResponse.json({
      success: true,
      message: 'User rodsct@gmail.com promoted to ADMIN with PRO subscription',
      user: {
        email: updatedUser.email,
        role: updatedUser.role,
        subscription: updatedUser.subscription,
        subscriptionEndsAt: updatedUser.subscriptionEndsAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error promoting user:', error);
    return NextResponse.json(
      { error: 'Promotion failed', details: error?.message },
      { status: 500 }
    );
  }
}