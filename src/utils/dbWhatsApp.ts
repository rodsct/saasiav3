import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface WhatsAppConfig {
  whatsappNumber?: string;
  whatsappMessage?: string;
  isWhatsappEnabled: boolean;
}

// Default WhatsApp configuration
const DEFAULT_WHATSAPP_CONFIG: WhatsAppConfig = {
  whatsappNumber: process.env.WHATSAPP_NUMBER || "+5215512345678",
  whatsappMessage: process.env.WHATSAPP_MESSAGE || "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.",
  isWhatsappEnabled: process.env.WHATSAPP_ENABLED === 'true' || true,
};

// Get WhatsApp configuration from database
export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  try {
    // Try to get from database first
    const config = await prisma.siteConfig.findFirst({
      select: {
        whatsappNumber: true,
        whatsappMessage: true,
        isWhatsappEnabled: true,
      }
    });

    if (config) {
      return {
        whatsappNumber: config.whatsappNumber || DEFAULT_WHATSAPP_CONFIG.whatsappNumber,
        whatsappMessage: config.whatsappMessage || DEFAULT_WHATSAPP_CONFIG.whatsappMessage,
        isWhatsappEnabled: config.isWhatsappEnabled
      };
    }

    // If no database config, initialize with default
    await initializeWhatsAppConfig();
    return DEFAULT_WHATSAPP_CONFIG;
  } catch (error) {
    console.error('Error getting WhatsApp config from database:', error);
    // Fallback to default configuration
    return DEFAULT_WHATSAPP_CONFIG;
  }
}

// Initialize WhatsApp configuration in database
export async function initializeWhatsAppConfig(): Promise<void> {
  try {
    // Check if config already exists
    const existingConfig = await prisma.siteConfig.findFirst();

    if (!existingConfig) {
      // Create new config
      await prisma.siteConfig.create({
        data: {
          whatsappNumber: DEFAULT_WHATSAPP_CONFIG.whatsappNumber,
          whatsappMessage: DEFAULT_WHATSAPP_CONFIG.whatsappMessage,
          isWhatsappEnabled: DEFAULT_WHATSAPP_CONFIG.isWhatsappEnabled,
          // Initialize pricing fields with defaults too
          proPriceId: process.env.STRIPE_DEFAULT_PRICE_ID || 'price_default',
          proPriceAmount: 4900,
          proPriceName: 'PRO',
        }
      });
      console.log('Initialized WhatsApp config in database');
    } else if (!existingConfig.whatsappNumber) {
      // Update existing config with WhatsApp fields
      await prisma.siteConfig.update({
        where: { id: existingConfig.id },
        data: {
          whatsappNumber: DEFAULT_WHATSAPP_CONFIG.whatsappNumber,
          whatsappMessage: DEFAULT_WHATSAPP_CONFIG.whatsappMessage,
          isWhatsappEnabled: DEFAULT_WHATSAPP_CONFIG.isWhatsappEnabled,
        }
      });
      console.log('Updated existing config with WhatsApp fields');
    }
  } catch (error) {
    console.error('Error initializing WhatsApp config:', error);
  }
}

// Update WhatsApp configuration in database
export async function updateWhatsAppConfig(config: WhatsAppConfig): Promise<boolean> {
  try {
    // Get or create site config
    let siteConfig = await prisma.siteConfig.findFirst();

    if (!siteConfig) {
      // Create new config
      siteConfig = await prisma.siteConfig.create({
        data: {
          whatsappNumber: config.whatsappNumber,
          whatsappMessage: config.whatsappMessage,
          isWhatsappEnabled: config.isWhatsappEnabled,
          // Initialize pricing fields with defaults
          proPriceId: process.env.STRIPE_DEFAULT_PRICE_ID || 'price_default',
          proPriceAmount: 4900,
          proPriceName: 'PRO',
        }
      });
    } else {
      // Update existing config
      siteConfig = await prisma.siteConfig.update({
        where: { id: siteConfig.id },
        data: {
          whatsappNumber: config.whatsappNumber,
          whatsappMessage: config.whatsappMessage,
          isWhatsappEnabled: config.isWhatsappEnabled,
        }
      });
    }

    console.log('Updated WhatsApp config in database:', config);
    return true;
  } catch (error) {
    console.error('Error updating WhatsApp config:', error);
    return false;
  }
}

// Clean up function
export async function closePrismaConnection(): Promise<void> {
  await prisma.$disconnect();
}