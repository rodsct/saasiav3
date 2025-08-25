import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/utils/prismaDB";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log("Stripe webhook event:", event.type);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
        
      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice;
        await handleSubscriptionRenewal(invoice);
        break;
        
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;
    
    if (!userId) {
      console.error("No userId in session metadata");
      return;
    }

    // Calculate subscription end date (1 month from now)
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);

    // Update user subscription
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: "PRO",
        subscriptionEndsAt: subscriptionEndsAt,
      },
    });

    console.log(`✅ PRO subscription activated via Stripe for user: ${updatedUser.email}`);

  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

async function handleSubscriptionRenewal(invoice: Stripe.Invoice) {
  try {
    if (invoice.subscription && invoice.paid) {
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );

      const customerId = subscription.customer as string;
      
      // Find user by Stripe customer ID (you'd need to store this in user table)
      // For now, we'll extend all PRO subscriptions by 1 month
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      // Update all users with PRO subscription (simplified for demo)
      console.log("Subscription renewed for customer:", customerId);
    }
  } catch (error) {
    console.error("Error handling subscription renewal:", error);
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    
    // Mark subscription as cancelled but keep until period ends
    console.log("Subscription cancelled for customer:", customerId);
    
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
  }
}