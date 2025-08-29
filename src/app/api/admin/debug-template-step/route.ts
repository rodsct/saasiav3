import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { EmailTemplateType } from "@prisma/client";
import { getSiteUrl } from "@/utils/siteConfig";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const templateType = url.searchParams.get('type') as EmailTemplateType;

    if (!templateType) {
      return NextResponse.json({ error: "Template type required" }, { status: 400 });
    }

    const debug = {
      step1_input: {
        templateType,
        timestamp: new Date().toISOString()
      },
      step2_database_query: {},
      step3_template_found: {},
      step4_variables: {},
      step5_processed: {}
    };

    // Step 2: Database query
    try {
      debug.step2_database_query = {
        status: "Searching for template in database",
        query: `findUnique({ where: { type: "${templateType}", isActive: true } })`
      };

      const template = await prisma.emailTemplate.findUnique({
        where: { type: templateType, isActive: true }
      });

      debug.step3_template_found = {
        found: !!template,
        template: template ? {
          type: template.type,
          subject: template.subject,
          isActive: template.isActive,
          createdAt: template.createdAt,
          htmlContentLength: template.htmlContent?.length || 0,
          textContentLength: template.textContent?.length || 0,
          variables: template.variables
        } : null
      };

      if (!template) {
        debug.step3_template_found.error = "Template not found in database";
        return NextResponse.json(debug);
      }

      // Step 4: Variables
      const defaultVariables = {
        SITE_NAME: 'Aranza.io',
        SITE_URL: getSiteUrl(),
        CURRENT_YEAR: new Date().getFullYear(),
        USER_EMAIL: 'test@example.com',
        USER_NAME: 'Test User'
      };

      debug.step4_variables = {
        defaultVariables,
        templateVariables: template.variables
      };

      // Step 5: Process template
      let processedSubject = template.subject;
      let processedHtml = template.htmlContent;

      Object.entries(defaultVariables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processedSubject = processedSubject.replace(regex, String(value || ''));
        if (processedHtml) {
          processedHtml = processedHtml.replace(regex, String(value || ''));
        }
      });

      debug.step5_processed = {
        originalSubject: template.subject,
        processedSubject,
        htmlProcessed: !!processedHtml,
        variablesReplaced: Object.keys(defaultVariables).length
      };

    } catch (dbError) {
      debug.step2_database_query = {
        error: "Database error: " + dbError?.toString()
      };
    }

    return NextResponse.json(debug);

  } catch (error) {
    return NextResponse.json({
      error: "Debug endpoint error: " + error?.toString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templateType, userEmail } = await request.json();

    if (!templateType || !userEmail) {
      return NextResponse.json({ 
        error: "templateType and userEmail required" 
      }, { status: 400 });
    }

    // This will actually attempt to send using the template system
    const { sendEmail } = await import("@/utils/emailService");
    const { EmailTemplateType } = await import("@prisma/client");

    console.log(`🧪 Debug template send for ${templateType} to ${userEmail}`);
    
    const result = await sendEmail(
      userEmail, 
      templateType as EmailTemplateType,
      {
        USER_NAME: 'Debug User'
      }
    );

    return NextResponse.json({
      success: result,
      message: result ? "Email sent successfully" : "Email failed to send",
      templateType,
      userEmail
    });

  } catch (error) {
    console.error('Debug template send error:', error);
    return NextResponse.json({
      error: "Error in debug send: " + error?.toString()
    }, { status: 500 });
  }
}