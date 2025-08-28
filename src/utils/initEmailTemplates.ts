// Initialize email templates in database
import { PrismaClient, EmailTemplateType } from '@prisma/client';
import { defaultEmailTemplates } from './emailTemplates';

const prisma = new PrismaClient();

export async function initializeEmailTemplates(): Promise<boolean> {
  try {
    console.log('🔧 Initializing email templates...');
    
    // Check if templates already exist
    const existingTemplates = await prisma.emailTemplate.findMany();
    
    if (existingTemplates.length > 0) {
      console.log(`✅ Email templates already initialized (${existingTemplates.length} templates)`);
      return true;
    }

    // Insert default templates
    for (const template of defaultEmailTemplates) {
      try {
        await prisma.emailTemplate.create({
          data: template
        });
        console.log(`✅ Created template: ${template.type}`);
      } catch (error) {
        console.error(`❌ Error creating template ${template.type}:`, error);
      }
    }

    console.log('✅ All email templates initialized successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error initializing email templates:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Function to check if email templates are properly configured
export async function checkEmailConfiguration(): Promise<{
  templatesReady: boolean;
  smtpReady: boolean;
  missingVars: string[];
}> {
  try {
    // Check database templates
    const templateCount = await prisma.emailTemplate.count();
    const templatesReady = templateCount > 0;

    // Check SMTP configuration
    const requiredVars = ['EMAIL_SERVER_HOST', 'EMAIL_SERVER_USER', 'EMAIL_SERVER_PASSWORD'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    const smtpReady = missingVars.length === 0;

    return {
      templatesReady,
      smtpReady,
      missingVars
    };
  } catch (error) {
    console.error('Error checking email configuration:', error);
    return {
      templatesReady: false,
      smtpReady: false,
      missingVars: []
    };
  } finally {
    await prisma.$disconnect();
  }
}