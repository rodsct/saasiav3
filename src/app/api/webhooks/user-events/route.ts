import { NextRequest, NextResponse } from "next/server";
import { 
  sendSubscriptionActivated, 
  sendSubscriptionCancelled,
  sendPaymentSuccess,
  sendSubscriptionFailed 
} from "@/utils/emailService";
import { buildUrl } from "@/utils/siteConfig";

export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json();

    // Validate webhook secret for security
    const providedSecret = request.headers.get('x-webhook-secret');
    const expectedSecret = process.env.WEBHOOK_SECRET || 'default-webhook-secret';
    
    if (providedSecret !== expectedSecret) {
      console.warn('Invalid webhook secret provided');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🔔 Processing user event:', event, data);

    switch (event) {
      case 'user.registered':
        await handleUserRegistered(data);
        break;
      case 'subscription.activated':
        await handleSubscriptionActivated(data);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data);
        break;
      case 'payment.success':
        await handlePaymentSuccess(data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(data);
        break;
      default:
        console.warn('Unknown event type:', event);
    }

    return NextResponse.json({ success: true, message: 'Event processed' });

  } catch (error) {
    console.error('User events webhook error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleUserRegistered(data: any) {
  try {
    const { userEmail, userName, needsVerification } = data;
    
    // If needs verification, send verification email instead of welcome
    if (needsVerification && data.verificationToken) {
      const verificationUrl = buildUrl(`/verify-email?token=${data.verificationToken}`);
      const { sendSimpleVerificationEmail } = await import('@/utils/simpleEmail');
      const success = await sendSimpleVerificationEmail(userEmail, verificationUrl, userName);
      
      if (success) {
        console.log('✅ Verification email sent to:', userEmail);
      } else {
        console.error('❌ Failed to send verification email to:', userEmail);
      }
    } else {
      // User doesn't need verification (e.g. OAuth), send welcome email
      const { sendSimpleWelcomeEmail } = await import('@/utils/simpleEmail');
      const success = await sendSimpleWelcomeEmail(userEmail, userName);
      
      if (success) {
        console.log('✅ Welcome email sent to:', userEmail);
      } else {
        console.error('❌ Failed to send welcome email to:', userEmail);
      }
    }
  } catch (error) {
    console.error('Error handling user registration:', error);
  }
}

async function handleSubscriptionActivated(data: any) {
  try {
    const { userEmail, userName, planName, planPrice } = data;
    
    const success = await sendSubscriptionActivated(
      userEmail,
      planName || 'PRO',
      planPrice || '$49.00/mes',
      userName
    );
    
    if (success) {
      console.log('✅ Subscription activated email sent to:', userEmail);
    } else {
      console.error('❌ Failed to send subscription activated email to:', userEmail);
    }
  } catch (error) {
    console.error('Error handling subscription activation:', error);
  }
}

async function handleSubscriptionCancelled(data: any) {
  try {
    const { userEmail, userName, planName, expirationDate } = data;
    
    const success = await sendSubscriptionCancelled(
      userEmail,
      planName || 'PRO',
      expirationDate,
      userName
    );
    
    if (success) {
      console.log('✅ Subscription cancelled email sent to:', userEmail);
    } else {
      console.error('❌ Failed to send subscription cancelled email to:', userEmail);
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handlePaymentSuccess(data: any) {
  try {
    const { userEmail, userName, amount, planName, nextBillingDate } = data;
    
    const success = await sendPaymentSuccess(
      userEmail,
      amount || '$49.00',
      planName || 'PRO',
      nextBillingDate,
      userName
    );
    
    if (success) {
      console.log('✅ Payment success email sent to:', userEmail);
    } else {
      console.error('❌ Failed to send payment success email to:', userEmail);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(data: any) {
  try {
    const { userEmail, userName, planName, retryDate } = data;
    
    const success = await sendSubscriptionFailed(
      userEmail,
      planName || 'PRO',
      retryDate,
      userName
    );
    
    if (success) {
      console.log('✅ Payment failed email sent to:', userEmail);
    } else {
      console.error('❌ Failed to send payment failed email to:', userEmail);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}