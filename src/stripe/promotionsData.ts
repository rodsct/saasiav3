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

export const promotionsData: Promotion[] = [
  {
    id: "WELCOME20",
    code: "WELCOME20", 
    description: "20% de descuento para nuevos usuarios",
    discountType: "PERCENTAGE",
    discountValue: 20,
    usageLimit: 100,
    usedCount: 0,
    isActive: true,
    createdAt: "2025-01-27T00:00:00.000Z"
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
    createdAt: "2025-01-27T00:00:00.000Z"
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
    createdAt: "2025-01-27T00:00:00.000Z"
  }
];