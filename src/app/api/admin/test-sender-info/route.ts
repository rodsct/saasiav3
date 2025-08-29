import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: NextRequest) {
  try {
    const debug = {
      step1: "Testing getSenderInfo function",
      step2_siteconfig_query: {},
      step3_fallback_values: {},
      step4_final_result: {}
    };

    // Test the exact same query as getSenderInfo
    try {
      debug.step2_siteconfig_query.status = "Querying siteConfig table";
      
      const siteConfig = await prisma.siteConfig.findFirst({
        select: {
          emailFromName: true,
          emailFromAddress: true,
        }
      });

      debug.step2_siteconfig_query.result = {
        found: !!siteConfig,
        data: siteConfig,
        count: siteConfig ? 1 : 0
      };

      // Test environment variables
      debug.step3_fallback_values = {
        EMAIL_FROM: process.env.EMAIL_FROM ? "SET" : "NOT_SET",
        EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER ? "SET" : "NOT_SET",
        EMAIL_FROM_value: process.env.EMAIL_FROM,
        EMAIL_SERVER_USER_value: process.env.EMAIL_SERVER_USER
      };

      // Calculate final result (same logic as getSenderInfo)
      debug.step4_final_result = {
        name: siteConfig?.emailFromName || 'Aranza.io',
        address: siteConfig?.emailFromAddress || process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || 'noreply@agente.aranza.io'
      };

    } catch (dbError) {
      debug.step2_siteconfig_query = {
        error: "Database error: " + dbError?.toString(),
        errorType: dbError?.constructor?.name
      };

      // Fallback values when DB fails
      debug.step4_final_result = {
        name: 'Aranza.io',
        address: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || 'noreply@agente.aranza.io'
      };
    }

    return NextResponse.json(debug);

  } catch (error) {
    return NextResponse.json({
      error: "Test getSenderInfo error: " + error?.toString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: "userEmail required" }, { status: 400 });
    }

    // Actually try to send an email using the template system
    console.log(`🧪 Testing full template email send to: ${userEmail}`);
    
    const { sendWelcomeEmail } = await import("@/utils/emailService");
    
    const result = await sendWelcomeEmail(userEmail, "Debug User");

    return NextResponse.json({
      success: result,
      message: result ? "Template email sent successfully!" : "Template email failed",
      userEmail
    });

  } catch (error) {
    console.error('Full template email test error:', error);
    return NextResponse.json({
      error: "Template email test failed: " + error?.toString()
    }, { status: 500 });
  }
}