import { PrismaClient, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

export interface PromotionData {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  expiresAt?: string;
  createdAt: string;
}

// Default promotions that should always be available
const DEFAULT_PROMOTIONS: Omit<PromotionData, 'createdAt'>[] = [
  {
    id: "WELCOME20",
    code: "WELCOME20", 
    description: "20% de descuento para nuevos usuarios",
    discountType: "PERCENTAGE",
    discountValue: 20,
    usageLimit: 100,
    usageCount: 0,
    isActive: true
  },
  {
    id: "SAVE30",
    code: "SAVE30",
    description: "30% de descuento especial",
    discountType: "PERCENTAGE", 
    discountValue: 30,
    usageLimit: 50,
    usageCount: 0,
    isActive: true
  },
  {
    id: "FIRST50",
    code: "FIRST50",
    description: "50% de descuento primera suscripción",
    discountType: "PERCENTAGE",
    discountValue: 50,
    usageLimit: 20,
    usageCount: 0,
    isActive: true
  }
];

// Initialize default promotions in database
export async function initializeDefaultPromotions(): Promise<void> {
  try {
    for (const promoData of DEFAULT_PROMOTIONS) {
      // Check if promotion already exists
      const existingPromo = await prisma.promotion.findUnique({
        where: { code: promoData.code }
      });

      if (!existingPromo) {
        // Create the promotion
        await prisma.promotion.create({
          data: {
            id: promoData.id,
            code: promoData.code,
            description: promoData.description,
            discountType: promoData.discountType as DiscountType,
            discountValue: promoData.discountValue,
            isActive: promoData.isActive,
            usageLimit: promoData.usageLimit,
            usageCount: promoData.usageCount,
            expiresAt: promoData.expiresAt ? new Date(promoData.expiresAt) : null,
          }
        });
        console.log('Created default promotion:', promoData.code);
      } else if (!existingPromo.isActive && promoData.isActive) {
        // Reactivate default promotion if it was deactivated
        await prisma.promotion.update({
          where: { id: existingPromo.id },
          data: { isActive: true }
        });
        console.log('Reactivated default promotion:', promoData.code);
      }
    }
  } catch (error) {
    console.error('Error initializing default promotions:', error);
  }
}

// Get all promotions from database
export async function getAllPromotions(): Promise<PromotionData[]> {
  try {
    // Initialize defaults if needed
    await initializeDefaultPromotions();

    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return promotions.map(promo => ({
      id: promo.id,
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType as "PERCENTAGE" | "FIXED_AMOUNT",
      discountValue: promo.discountValue,
      isActive: promo.isActive,
      usageLimit: promo.usageLimit || undefined,
      usageCount: promo.usageCount,
      expiresAt: promo.expiresAt?.toISOString(),
      createdAt: promo.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('Error getting promotions from database:', error);
    // Return default promotions as fallback
    return DEFAULT_PROMOTIONS.map(promo => ({
      ...promo,
      createdAt: new Date().toISOString()
    }));
  }
}

// Find active promotion by code
export async function findActivePromotion(code: string): Promise<PromotionData | undefined> {
  try {
    const promotion = await prisma.promotion.findFirst({
      where: {
        code: { equals: code, mode: 'insensitive' },
        isActive: true
      }
    });

    if (!promotion) return undefined;

    return {
      id: promotion.id,
      code: promotion.code,
      description: promotion.description,
      discountType: promotion.discountType as "PERCENTAGE" | "FIXED_AMOUNT",
      discountValue: promotion.discountValue,
      isActive: promotion.isActive,
      usageLimit: promotion.usageLimit || undefined,
      usageCount: promotion.usageCount,
      expiresAt: promotion.expiresAt?.toISOString(),
      createdAt: promotion.createdAt.toISOString()
    };
  } catch (error) {
    console.error('Error finding promotion:', error);
    return undefined;
  }
}

// Create new promotion
export async function createPromotion(promotionData: {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  usageLimit?: number;
  expiresAt?: string;
}): Promise<{ success: boolean; error?: string; promotion?: PromotionData }> {
  try {
    // Check if code already exists
    const existingPromo = await prisma.promotion.findFirst({
      where: { code: { equals: promotionData.code, mode: 'insensitive' } }
    });

    if (existingPromo) {
      return {
        success: false,
        error: 'El código de promoción ya existe'
      };
    }

    // Create the promotion
    const newPromotion = await prisma.promotion.create({
      data: {
        code: promotionData.code.toUpperCase(),
        description: promotionData.description,
        discountType: promotionData.discountType as DiscountType,
        discountValue: promotionData.discountValue,
        isActive: true,
        usageLimit: promotionData.usageLimit || null,
        usageCount: 0,
        expiresAt: promotionData.expiresAt ? new Date(promotionData.expiresAt) : null,
      }
    });

    console.log('Created promotion in database:', newPromotion.code);

    return {
      success: true,
      promotion: {
        id: newPromotion.id,
        code: newPromotion.code,
        description: newPromotion.description,
        discountType: newPromotion.discountType as "PERCENTAGE" | "FIXED_AMOUNT",
        discountValue: newPromotion.discountValue,
        isActive: newPromotion.isActive,
        usageLimit: newPromotion.usageLimit || undefined,
        usageCount: newPromotion.usageCount,
        expiresAt: newPromotion.expiresAt?.toISOString(),
        createdAt: newPromotion.createdAt.toISOString()
      }
    };
  } catch (error) {
    console.error('Error creating promotion:', error);
    return {
      success: false,
      error: 'Error al crear la promoción en la base de datos'
    };
  }
}

// Update promotion
export async function updatePromotion(
  id: string, 
  updates: { isActive?: boolean; description?: string; discountValue?: number; usageLimit?: number }
): Promise<boolean> {
  try {
    await prisma.promotion.update({
      where: { id },
      data: updates
    });

    console.log('Updated promotion in database:', id);
    return true;
  } catch (error) {
    console.error('Error updating promotion:', error);
    return false;
  }
}

// Delete promotion (only non-default ones)
export async function deletePromotion(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if it's a default promotion
    const defaultIds = DEFAULT_PROMOTIONS.map(p => p.id);
    if (defaultIds.includes(id)) {
      return {
        success: false,
        error: 'No se pueden eliminar las promociones predeterminadas'
      };
    }

    await prisma.promotion.delete({
      where: { id }
    });

    console.log('Deleted promotion from database:', id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return {
      success: false,
      error: 'Error al eliminar la promoción de la base de datos'
    };
  }
}

// Increment usage count for a promotion
export async function incrementPromotionUsage(code: string): Promise<boolean> {
  try {
    await prisma.promotion.update({
      where: { code: code.toUpperCase() },
      data: { usageCount: { increment: 1 } }
    });

    console.log('Incremented usage count for promotion:', code);
    return true;
  } catch (error) {
    console.error('Error incrementing promotion usage:', error);
    return false;
  }
}

// Clean up function
export async function closePrismaConnection(): Promise<void> {
  await prisma.$disconnect();
}