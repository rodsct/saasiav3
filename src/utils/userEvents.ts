// User event triggers for email notifications
// Use these functions to trigger email notifications throughout the application

import { getSiteUrl } from './siteConfig';

// Internal webhook endpoint
const WEBHOOK_URL = `${getSiteUrl()}/api/webhooks/user-events`;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default-webhook-secret';

// Base function to send webhook events
async function sendWebhookEvent(event: string, data: any): Promise<boolean> {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify({ event, data }),
    });

    if (response.ok) {
      console.log(`✅ Event triggered: ${event}`);
      return true;
    } else {
      console.error(`❌ Failed to trigger event: ${event}`, await response.text());
      return false;
    }
  } catch (error) {
    console.error(`❌ Error triggering event: ${event}`, error);
    return false;
  }
}

// User registration event
export async function triggerUserRegistered(
  userEmail: string,
  userName?: string,
  needsVerification: boolean = false,
  verificationToken?: string
): Promise<boolean> {
  return sendWebhookEvent('user.registered', {
    userEmail,
    userName,
    needsVerification,
    verificationToken,
  });
}

// Subscription activated event
export async function triggerSubscriptionActivated(
  userEmail: string,
  planName: string,
  planPrice: string,
  userName?: string
): Promise<boolean> {
  return sendWebhookEvent('subscription.activated', {
    userEmail,
    userName,
    planName,
    planPrice,
  });
}

// Subscription cancelled event
export async function triggerSubscriptionCancelled(
  userEmail: string,
  planName: string,
  userName?: string,
  expirationDate?: string
): Promise<boolean> {
  return sendWebhookEvent('subscription.cancelled', {
    userEmail,
    userName,
    planName,
    expirationDate,
  });
}

// Payment success event
export async function triggerPaymentSuccess(
  userEmail: string,
  amount: string,
  planName: string,
  userName?: string,
  nextBillingDate?: string
): Promise<boolean> {
  return sendWebhookEvent('payment.success', {
    userEmail,
    userName,
    amount,
    planName,
    nextBillingDate,
  });
}

// Payment failed event
export async function triggerPaymentFailed(
  userEmail: string,
  planName: string,
  userName?: string,
  retryDate?: string
): Promise<boolean> {
  return sendWebhookEvent('payment.failed', {
    userEmail,
    userName,
    planName,
    retryDate,
  });
}

// Email verification event
export async function triggerEmailVerification(
  userEmail: string,
  verificationToken: string,
  userName?: string
): Promise<boolean> {
  return sendWebhookEvent('email.verification', {
    userEmail,
    userName,
    verificationToken,
  });
}

// Password reset event
export async function triggerPasswordReset(
  userEmail: string,
  resetToken: string,
  userName?: string
): Promise<boolean> {
  return sendWebhookEvent('password.reset', {
    userEmail,
    userName,
    resetToken,
  });
}

// Test function to trigger a user registration event
export async function testUserRegistration(email: string): Promise<boolean> {
  return triggerUserRegistered(email, 'Usuario de Prueba', false);
}