interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  createdAt: string;
}

// Shared in-memory storage for promotions (same pattern as WhatsApp config)
let tempPromotions: Promotion[] = [
  {
    id: "WELCOME20",
    code: "WELCOME20", 
    description: "20% de descuento para nuevos usuarios",
    discountType: "PERCENTAGE",
    discountValue: 20,
    usageLimit: 100,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    expiresAt: undefined
  },
  {
    id: "SAVE30",
    code: "SAVE30",
    description: "30% de descuento especial",
    discountType: "PERCENTAGE", 
    discountValue: 30,
    usageLimit: 50,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    expiresAt: undefined
  },
  {
    id: "FIRST50",
    code: "FIRST50",
    description: "50% de descuento primera suscripción",
    discountType: "PERCENTAGE",
    discountValue: 50,
    usageLimit: 20,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    expiresAt: undefined
  }
];

export function getTempPromotions(): Promotion[] {
  return tempPromotions;
}

export function addTempPromotion(promotion: Promotion): void {
  tempPromotions.push(promotion);
}

export function findTempPromotion(code: string): Promotion | undefined {
  return tempPromotions.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
}

export function updateTempPromotion(id: string, updates: Partial<Promotion>): boolean {
  const index = tempPromotions.findIndex(p => p.id === id);
  if (index !== -1) {
    tempPromotions[index] = { ...tempPromotions[index], ...updates };
    return true;
  }
  return false;
}

export function deleteTempPromotion(id: string): boolean {
  const index = tempPromotions.findIndex(p => p.id === id);
  if (index !== -1) {
    tempPromotions.splice(index, 1);
    return true;
  }
  return false;
}