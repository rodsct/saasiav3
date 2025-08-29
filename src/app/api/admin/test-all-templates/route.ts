import { NextRequest, NextResponse } from "next/server";
import { 
  sendWelcomeEmail,
  sendEmailVerification,
  sendSubscriptionActivated,
  sendSubscriptionCancelled,
  sendSubscriptionFailed,
  sendPaymentSuccess
} from "@/utils/emailService";
import { getSiteUrl } from "@/utils/siteConfig";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        error: "Email es requerido" 
      }, { status: 400 });
    }

    console.log(`🧪 Testing all email templates for: ${email}`);

    const results = {
      email,
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test Welcome Email
    try {
      const success = await sendWelcomeEmail(email, "Usuario de Prueba");
      results.tests.push({
        template: "WELCOME_REGISTRATION",
        success,
        message: success ? "✅ Correo de bienvenida enviado" : "❌ Falló correo de bienvenida"
      });
    } catch (error) {
      results.tests.push({
        template: "WELCOME_REGISTRATION",
        success: false,
        message: "❌ Error: " + error?.toString()
      });
    }

    // Wait a bit between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test Email Verification
    try {
      const verificationUrl = `${getSiteUrl()}/verify-email?token=test-token-123`;
      const success = await sendEmailVerification(email, verificationUrl, "Usuario de Prueba");
      results.tests.push({
        template: "EMAIL_VERIFICATION",
        success,
        message: success ? "✅ Correo de verificación enviado" : "❌ Falló correo de verificación"
      });
    } catch (error) {
      results.tests.push({
        template: "EMAIL_VERIFICATION",
        success: false,
        message: "❌ Error: " + error?.toString()
      });
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test Subscription Activated
    try {
      const success = await sendSubscriptionActivated(email, "PRO", "$49.00/mes", "Usuario de Prueba");
      results.tests.push({
        template: "SUBSCRIPTION_ACTIVATED",
        success,
        message: success ? "✅ Correo de suscripción activada enviado" : "❌ Falló correo de suscripción activada"
      });
    } catch (error) {
      results.tests.push({
        template: "SUBSCRIPTION_ACTIVATED",
        success: false,
        message: "❌ Error: " + error?.toString()
      });
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test Subscription Cancelled
    try {
      const success = await sendSubscriptionCancelled(email, "PRO", "31/12/2024", "Usuario de Prueba");
      results.tests.push({
        template: "SUBSCRIPTION_CANCELLED",
        success,
        message: success ? "✅ Correo de suscripción cancelada enviado" : "❌ Falló correo de suscripción cancelada"
      });
    } catch (error) {
      results.tests.push({
        template: "SUBSCRIPTION_CANCELLED",
        success: false,
        message: "❌ Error: " + error?.toString()
      });
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test Payment Success
    try {
      const success = await sendPaymentSuccess(email, "$49.00", "PRO", "31/01/2025", "Usuario de Prueba");
      results.tests.push({
        template: "PAYMENT_SUCCESS",
        success,
        message: success ? "✅ Correo de pago exitoso enviado" : "❌ Falló correo de pago exitoso"
      });
    } catch (error) {
      results.tests.push({
        template: "PAYMENT_SUCCESS",
        success: false,
        message: "❌ Error: " + error?.toString()
      });
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test Subscription Failed
    try {
      const success = await sendSubscriptionFailed(email, "PRO", "05/01/2025", "Usuario de Prueba");
      results.tests.push({
        template: "SUBSCRIPTION_FAILED",
        success,
        message: success ? "✅ Correo de pago fallido enviado" : "❌ Falló correo de pago fallido"
      });
    } catch (error) {
      results.tests.push({
        template: "SUBSCRIPTION_FAILED",
        success: false,
        message: "❌ Error: " + error?.toString()
      });
    }

    // Summary
    const totalTests = results.tests.length;
    const successfulTests = results.tests.filter(test => test.success).length;
    const failedTests = totalTests - successfulTests;

    results.summary = {
      total: totalTests,
      successful: successfulTests,
      failed: failedTests,
      success_rate: `${Math.round((successfulTests / totalTests) * 100)}%`
    };

    console.log(`🧪 Template testing completed: ${successfulTests}/${totalTests} successful`);

    return NextResponse.json(results);

  } catch (error) {
    console.error("Template testing error:", error);
    return NextResponse.json({
      error: "Error testing email templates: " + error?.toString()
    }, { status: 500 });
  }
}