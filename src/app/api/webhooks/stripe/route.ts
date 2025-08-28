import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/utils/prismaDB";
import { 
  triggerSubscriptionActivated, 
  triggerPaymentSuccess, 
  triggerSubscriptionCancelled,
  triggerPaymentFailed 
} from "@/utils/userEvents";

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
        
      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailure(failedInvoice);
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

    // Trigger subscription activated email
    const amount = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : '$49.00';
    const nextBillingDate = subscriptionEndsAt.toISOString().split('T')[0];
    
    await triggerSubscriptionActivated(
      updatedUser.email,
      'PRO',
      '$49.00/mes',
      updatedUser.name || undefined
    );

    await triggerPaymentSuccess(
      updatedUser.email,
      amount,
      'PRO',
      updatedUser.name || undefined,
      nextBillingDate
    );

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
      
      // Get customer email from Stripe
      const customer = await stripe.customers.retrieve(customerId);
      let customerEmail = '';
      
      if (customer && !customer.deleted && customer.email) {
        customerEmail = customer.email;
        
        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: customerEmail }
        });

        if (user) {
          // Extend subscription by 1 month
          const subscriptionEndsAt = new Date();
          subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);

          await prisma.user.update({
            where: { id: user.id },
            data: { subscriptionEndsAt }
          });

          // Trigger payment success email
          const amount = invoice.amount_paid ? `$${(invoice.amount_paid / 100).toFixed(2)}` : '$49.00';
          const nextBillingDate = subscriptionEndsAt.toISOString().split('T')[0];

          await triggerPaymentSuccess(
            user.email,
            amount,
            'PRO',
            user.name || undefined,
            nextBillingDate
          );

          console.log("✅ Subscription renewed and email sent to:", user.email);
        }
      }
    }
  } catch (error) {
    console.error("Error handling subscription renewal:", error);
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    
    // Get customer email from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer && !customer.deleted && customer.email) {
      // Find user in database
      const user = await prisma.user.findUnique({
        where: { email: customer.email }
      });

      if (user) {
        // Update user subscription status but keep until period ends
        await prisma.user.update({
          where: { id: user.id },
          data: { subscription: "FREE" }
        });

        // Calculate expiration date (current subscription end or now)
        const expirationDate = user.subscriptionEndsAt 
          ? user.subscriptionEndsAt.toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        // Trigger subscription cancelled email
        await triggerSubscriptionCancelled(
          user.email,
          'PRO',
          user.name || undefined,
          expirationDate
        );

        console.log("✅ Subscription cancelled and email sent to:", user.email);
      }
    }
    
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
  }
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    
    // Get customer email from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer && !customer.deleted && customer.email) {
      // Find user in database
      const user = await prisma.user.findUnique({
        where: { email: customer.email }
      });

      if (user) {
        // Calculate retry date (usually 3-7 days from now)
        const retryDate = new Date();
        retryDate.setDate(retryDate.getDate() + 3);
        const retryDateString = retryDate.toISOString().split('T')[0];

        // Trigger payment failed email
        await triggerPaymentFailed(
          user.email,
          'PRO',
          user.name || undefined,
          retryDateString
        );

        console.log("✅ Payment failure email sent to:", user.email);
      }
    }
    
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}