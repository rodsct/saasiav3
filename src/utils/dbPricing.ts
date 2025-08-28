import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PricingConfig {
  priceId: string;
  amount: number; // in cents (4900 = $49.00)
  name: string;
}

// Default pricing configuration
const DEFAULT_PRICING: PricingConfig = {
  priceId: process.env.STRIPE_DEFAULT_PRICE_ID || 'price_default',
  amount: 4900, // $49.00
  name: 'PRO'
};

// Get current pricing configuration from database
export async function getCurrentPricing(): Promise<PricingConfig> {
  try {
    // Try to get from database first
    const config = await prisma.siteConfig.findFirst({
      select: {
        proPriceId: true,
        proPriceAmount: true,
        proPriceName: true,
      }
    });

    if (config?.proPriceId && config?.proPriceAmount) {
      return {
        priceId: config.proPriceId,
        amount: config.proPriceAmount,
        name: config.proPriceName || 'PRO'
      };
    }

    // If no database config, initialize with default
    await initializePricingConfig();
    return DEFAULT_PRICING;
  } catch (error) {
    console.error('Error getting pricing from database:', error);
    // Fallback to default pricing
    return DEFAULT_PRICING;
  }
}

// Initialize pricing configuration in database
export async function initializePricingConfig(): Promise<void> {
  try {
    // Check if config already exists
    const existingConfig = await prisma.siteConfig.findFirst();

    if (!existingConfig) {
      // Create new config
      await prisma.siteConfig.create({
        data: {
          proPriceId: DEFAULT_PRICING.priceId,
          proPriceAmount: DEFAULT_PRICING.amount,
          proPriceName: DEFAULT_PRICING.name,
          whatsappNumber: process.env.WHATSAPP_NUMBER || "+5215512345678",
          whatsappMessage: process.env.WHATSAPP_MESSAGE || "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.",
          isWhatsappEnabled: process.env.WHATSAPP_ENABLED === 'true' || true,
        }
      });
      console.log('Initialized pricing config in database');
    } else if (!existingConfig.proPriceId) {
      // Update existing config with pricing fields
      await prisma.siteConfig.update({
        where: { id: existingConfig.id },
        data: {
          proPriceId: DEFAULT_PRICING.priceId,
          proPriceAmount: DEFAULT_PRICING.amount,
          proPriceName: DEFAULT_PRICING.name,
        }
      });
      console.log('Updated existing config with pricing fields');
    }
  } catch (error) {
    console.error('Error initializing pricing config:', error);
  }
}

// Update pricing configuration in database
export async function updatePricingConfig(pricing: PricingConfig): Promise<boolean> {
  try {
    // Get or create site config
    let config = await prisma.siteConfig.findFirst();

    if (!config) {
      // Create new config
      config = await prisma.siteConfig.create({
        data: {
          proPriceId: pricing.priceId,
          proPriceAmount: pricing.amount,
          proPriceName: pricing.name,
          whatsappNumber: process.env.WHATSAPP_NUMBER || "+5215512345678",
          whatsappMessage: process.env.WHATSAPP_MESSAGE || "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.",
          isWhatsappEnabled: process.env.WHATSAPP_ENABLED === 'true' || true,
        }
      });
    } else {
      // Update existing config
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          proPriceId: pricing.priceId,
          proPriceAmount: pricing.amount,
          proPriceName: pricing.name,
        }
      });
    }

    console.log('Updated pricing config in database:', pricing);
    return true;
  } catch (error) {
    console.error('Error updating pricing config:', error);
    return false;
  }
}

// Clean up function
export async function closePrismaConnection(): Promise<void> {
  await prisma.$disconnect();
}