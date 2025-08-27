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

// Default promotions (always available)
const DEFAULT_PROMOTIONS: Promotion[] = [
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

// Get custom promotions from environment variable
function getCustomPromotions(): Promotion[] {
  try {
    const customPromosEnv = process.env.CUSTOM_PROMOTIONS;
    if (!customPromosEnv) {
      return [];
    }
    
    const customPromos = JSON.parse(customPromosEnv) as Promotion[];
    console.log('Loaded custom promotions from env:', customPromos.length);
    return customPromos;
  } catch (error) {
    console.error('Error parsing custom promotions from env:', error);
    return [];
  }
}

// Save custom promotions to environment
function saveCustomPromotions(promotions: Promotion[]): void {
  try {
    const customPromosJson = JSON.stringify(promotions);
    process.env.CUSTOM_PROMOTIONS = customPromosJson;
    console.log('Saved custom promotions to env:', promotions.length);
  } catch (error) {
    console.error('Error saving custom promotions to env:', error);
  }
}

// Get all promotions (default + custom)
export function getAllPromotions(): Promotion[] {
  const customPromotions = getCustomPromotions();
  const allPromotions = [...DEFAULT_PROMOTIONS, ...customPromotions];
  
  console.log('Total promotions:', allPromotions.length, 
              '(', DEFAULT_PROMOTIONS.length, 'default +', customPromotions.length, 'custom)');
  
  return allPromotions;
}

// Find active promotion by code
export function findActivePromotion(code: string): Promotion | undefined {
  const allPromotions = getAllPromotions();
  return allPromotions.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
}

// Add new promotion (only custom ones)
export function addCustomPromotion(promotion: Promotion): boolean {
  try {
    const allPromotions = getAllPromotions();
    
    // Check if code already exists (in both default and custom)
    const existingPromo = allPromotions.find(p => p.code.toUpperCase() === promotion.code.toUpperCase());
    if (existingPromo) {
      console.log('Promotion code already exists:', promotion.code);
      return false;
    }
    
    const customPromotions = getCustomPromotions();
    customPromotions.push(promotion);
    saveCustomPromotions(customPromotions);
    
    console.log('Added custom promotion:', promotion.code);
    return true;
  } catch (error) {
    console.error('Error adding custom promotion:', error);
    return false;
  }
}

// Update promotion (only custom ones, default ones can't be modified)
export function updatePromotion(id: string, updates: Partial<Promotion>): boolean {
  try {
    // Don't allow updating default promotions
    const defaultPromo = DEFAULT_PROMOTIONS.find(p => p.id === id);
    if (defaultPromo) {
      console.log('Cannot update default promotion:', id);
      return false;
    }
    
    const customPromotions = getCustomPromotions();
    const index = customPromotions.findIndex(p => p.id === id);
    
    if (index === -1) {
      console.log('Custom promotion not found:', id);
      return false;
    }
    
    customPromotions[index] = { ...customPromotions[index], ...updates };
    saveCustomPromotions(customPromotions);
    
    console.log('Updated custom promotion:', id);
    return true;
  } catch (error) {
    console.error('Error updating promotion:', error);
    return false;
  }
}

// Delete promotion (only custom ones, default ones can't be deleted)
export function deleteCustomPromotion(id: string): boolean {
  try {
    // Don't allow deleting default promotions
    const defaultPromo = DEFAULT_PROMOTIONS.find(p => p.id === id);
    if (defaultPromo) {
      console.log('Cannot delete default promotion:', id);
      return false;
    }
    
    const customPromotions = getCustomPromotions();
    const filteredPromotions = customPromotions.filter(p => p.id !== id);
    
    if (filteredPromotions.length === customPromotions.length) {
      console.log('Custom promotion not found:', id);
      return false;
    }
    
    saveCustomPromotions(filteredPromotions);
    
    console.log('Deleted custom promotion:', id);
    return true;
  } catch (error) {
    console.error('Error deleting custom promotion:', error);
    return false;
  }
}