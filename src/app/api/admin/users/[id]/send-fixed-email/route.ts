import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { EmailTemplateType } from "@prisma/client";
import { getSiteUrl } from "@/utils/siteConfig";
import nodemailer from 'nodemailer';

// Same createTransporter as working sendTestEmail
function createTransporter(): nodemailer.Transporter | null {
  try {
    const host = process.env.EMAIL_SERVER_HOST;
    const port = parseInt(process.env.EMAIL_SERVER_PORT || '587');
    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;

    if (!host || !user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  } catch (error) {
    return null;
  }
}

// Fixed version of sendEmail that uses same sender as working test
async function sendEmailFixed(
  to: string,
  templateType: EmailTemplateType,
  variables: any = {}
): Promise<boolean> {
  try {
    console.log(`🔧 Fixed sendEmail for ${templateType} to ${to}`);
    
    // Get transporter (same as working test)
    const transporter = createTransporter();
    if (!transporter) {
      console.error('❌ Email transporter not available');
      return false;
    }

    // Get template (this part works)
    const template = await prisma.emailTemplate.findUnique({
      where: { type: templateType, isActive: true }
    });

    if (!template) {
      console.error(`❌ Template not found for type: ${templateType}`);
      return false;
    }

    // Use SAME sender info as working sendTestEmail
    const senderName = 'Aranza.io';
    const senderAddress = process.env.EMAIL_SERVER_USER || 'noreply@agente.aranza.io';

    // Default variables (this part works)
    const defaultVariables = {
      SITE_NAME: 'Aranza.io',
      SITE_URL: getSiteUrl(),
      CURRENT_YEAR: new Date().getFullYear(),
      USER_EMAIL: to,
      ...variables
    };

    // Replace variables (this part works)
    let subject = template.subject;
    let htmlContent = template.htmlContent;
    let textContent = template.textContent;

    Object.entries(defaultVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value || ''));
      if (htmlContent) {
        htmlContent = htmlContent.replace(regex, String(value || ''));
      }
      if (textContent) {
        textContent = textContent.replace(regex, String(value || ''));
      }
    });

    // Send email with SAME format as working test
    const mailOptions = {
      from: `"${senderName}" <${senderAddress}>`, // SAME as sendTestEmail
      to,
      subject,
      html: htmlContent,
      text: textContent,
    };

    console.log('📤 Sending FIXED email with options:', { 
      from: mailOptions.from, 
      to: mailOptions.to, 
      subject: mailOptions.subject 
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ FIXED email sent successfully:', result.messageId);
    return true;

  } catch (error) {
    console.error('❌ Error sending FIXED email:', error);
    return false;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { emailType } = await request.json();
    const userId = params.id;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let success = false;
    const userName = user.name || "Usuario";

    if (emailType === 'welcome') {
      success = await sendEmailFixed(
        user.email, 
        EmailTemplateType.WELCOME_REGISTRATION,
        { USER_NAME: userName }
      );
    } else if (emailType === 'verification') {
      const verificationUrl = `${getSiteUrl()}/verify-email?email=${encodeURIComponent(user.email)}`;
      success = await sendEmailFixed(
        user.email,
        EmailTemplateType.EMAIL_VERIFICATION,
        { 
          USER_NAME: userName,
          VERIFICATION_URL: verificationUrl
        }
      );
    } else {
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `FIXED ${emailType} email sent successfully`,
        sentTo: user.email 
      });
    } else {
      return NextResponse.json({ 
        error: `Failed to send FIXED ${emailType} email`
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Send FIXED email error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.toString() },
      { status: 500 }
    );
  }
}