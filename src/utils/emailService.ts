import nodemailer from 'nodemailer';
import { PrismaClient, EmailTemplateType } from '@prisma/client';
import { getSiteUrl } from './siteConfig';

const prisma = new PrismaClient();

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email template variables
interface EmailVariables {
  [key: string]: string | number | undefined;
}

// Create email transporter
function createTransporter(): nodemailer.Transporter | null {
  try {
    const host = process.env.EMAIL_SERVER_HOST;
    const port = parseInt(process.env.EMAIL_SERVER_PORT || '587');
    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;

    if (!host || !user || !pass) {
      console.warn('Email configuration incomplete. Missing EMAIL_SERVER_* environment variables');
      return null;
    }

    const config: EmailConfig = {
      host,
      port,
      secure: port === 465, // Use SSL for port 465, TLS for others
      auth: {
        user,
        pass,
      },
    };

    // Try both createTransporter and createTransport
    if (typeof nodemailer.createTransporter === 'function') {
      return nodemailer.createTransporter(config);
    } else if (typeof nodemailer.createTransport === 'function') {
      return nodemailer.createTransport(config);
    } else {
      throw new Error('Neither createTransporter nor createTransport are available');
    }
  } catch (error) {
    console.error('Error creating email transporter:', error);
    return null;
  }
}

// Get email template from database
async function getEmailTemplate(type: EmailTemplateType): Promise<any> {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { type, isActive: true }
    });

    if (!template) {
      console.warn(`Email template not found for type: ${type}`);
      return null;
    }

    return template;
  } catch (error) {
    console.error('Error fetching email template:', error);
    return null;
  }
}

// Replace variables in template content
function replaceVariables(content: string, variables: EmailVariables): string {
  let processedContent = content;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedContent = processedContent.replace(regex, String(value || ''));
  });

  return processedContent;
}

// Get sender information (fixed version that works like sendTestEmail)
async function getSenderInfo(): Promise<{ name: string; address: string }> {
  // Use the same values as the working sendTestEmail function
  // This avoids issues with siteConfig database queries
  const senderName = 'Aranza.io';
  const senderAddress = process.env.EMAIL_SERVER_USER || 'noreply@agente.aranza.io';
  
  return {
    name: senderName,
    address: senderAddress
  };
}

// Main function to send email
export async function sendEmail(
  to: string,
  templateType: EmailTemplateType,
  variables: EmailVariables = {}
): Promise<boolean> {
  try {
    // Get transporter
    const transporter = createTransporter();
    if (!transporter) {
      console.error('Email transporter not available');
      return false;
    }

    // Get template
    const template = await getEmailTemplate(templateType);
    if (!template) {
      console.error(`Template not found for type: ${templateType}`);
      return false;
    }

    // Get sender info
    const sender = await getSenderInfo();

    // Add default variables
    const defaultVariables: EmailVariables = {
      SITE_NAME: 'Aranza.io',
      SITE_URL: getSiteUrl(),
      CURRENT_YEAR: new Date().getFullYear(),
      USER_EMAIL: to,
      ...variables
    };

    // Replace variables in content
    const subject = replaceVariables(template.subject, defaultVariables);
    const htmlContent = replaceVariables(template.htmlContent, defaultVariables);
    const textContent = template.textContent ? replaceVariables(template.textContent, defaultVariables) : undefined;

    // Send email
    const mailOptions = {
      from: `"${sender.name}" <${sender.address}>`,
      to,
      subject,
      html: htmlContent,
      text: textContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', { to, templateType, messageId: result.messageId });
    return true;

  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Specific email functions for different events
export async function sendWelcomeEmail(
  userEmail: string,
  userName?: string,
  verificationUrl?: string
): Promise<boolean> {
  return sendEmail(userEmail, EmailTemplateType.WELCOME_REGISTRATION, {
    USER_NAME: userName || 'Usuario',
    VERIFICATION_URL: verificationUrl
  });
}

export async function sendEmailVerification(
  userEmail: string,
  verificationUrl: string,
  userName?: string
): Promise<boolean> {
  return sendEmail(userEmail, EmailTemplateType.EMAIL_VERIFICATION, {
    USER_NAME: userName || 'Usuario',
    VERIFICATION_URL: verificationUrl
  });
}

export async function sendPasswordReset(
  userEmail: string,
  resetUrl: string,
  userName?: string
): Promise<boolean> {
  return sendEmail(userEmail, EmailTemplateType.PASSWORD_RESET, {
    USER_NAME: userName || 'Usuario',
    RESET_URL: resetUrl
  });
}

export async function sendSubscriptionActivated(
  userEmail: string,
  planName: string,
  planPrice: string,
  userName?: string
): Promise<boolean> {
  return sendEmail(userEmail, EmailTemplateType.SUBSCRIPTION_ACTIVATED, {
    USER_NAME: userName || 'Usuario',
    PLAN_NAME: planName,
    PLAN_PRICE: planPrice
  });
}

export async function sendSubscriptionCancelled(
  userEmail: string,
  planName: string,
  expirationDate?: string,
  userName?: string
): Promise<boolean> {
  return sendEmail(userEmail, EmailTemplateType.SUBSCRIPTION_CANCELLED, {
    USER_NAME: userName || 'Usuario',
    PLAN_NAME: planName,
    EXPIRATION_DATE: expirationDate || 'inmediatamente'
  });
}

export async function sendSubscriptionFailed(
  userEmail: string,
  planName: string,
  retryDate?: string,
  userName?: string
): Promise<boolean> {
  return sendEmail(userEmail, EmailTemplateType.SUBSCRIPTION_FAILED, {
    USER_NAME: userName || 'Usuario',
    PLAN_NAME: planName,
    RETRY_DATE: retryDate || 'próximamente'
  });
}

export async function sendPaymentSuccess(
  userEmail: string,
  amount: string,
  planName: string,
  nextBillingDate?: string,
  userName?: string
): Promise<boolean> {
  return sendEmail(userEmail, EmailTemplateType.PAYMENT_SUCCESS, {
    USER_NAME: userName || 'Usuario',
    AMOUNT: amount,
    PLAN_NAME: planName,
    NEXT_BILLING_DATE: nextBillingDate || 'próximo mes'
  });
}

// Test email function
export async function sendTestEmail(to: string): Promise<boolean> {
  try {
    console.log('🔧 Starting test email process...');
    
    const transporter = createTransporter();
    if (!transporter) {
      console.error('❌ Failed to create email transporter');
      return false;
    }

    console.log('✅ Email transporter created successfully');
    
    // Use simple sender info to avoid database dependencies
    const senderName = 'Aranza.io';
    const senderAddress = process.env.EMAIL_SERVER_USER || 'noreply@agente.aranza.io';
    
    console.log('📧 Sender info:', { senderName, senderAddress });
    
    const mailOptions = {
      from: `"${senderName}" <${senderAddress}>`,
      to,
      subject: 'Test Email - Configuración de Email Funcional',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00d4ff;">✅ Test Email Exitoso</h2>
          <p>Este es un email de prueba para confirmar que la configuración de correo está funcionando correctamente.</p>
          <p><strong>Sitio:</strong> ${getSiteUrl()}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Este email fue enviado desde el panel de administración de ${getSiteUrl()}
          </p>
        </div>
      `,
      text: 'Test Email - La configuración de email está funcionando correctamente.'
    };

    console.log('📤 Sending email with options:', { 
      from: mailOptions.from, 
      to: mailOptions.to, 
      subject: mailOptions.subject 
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return false;
  }
}

// Clean up function
export async function closePrismaConnection(): Promise<void> {
  await prisma.$disconnect();
}