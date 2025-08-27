import fs from 'fs';
import path from 'path';

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

const PROMOTIONS_FILE_PATH = path.join(process.cwd(), 'src', 'stripe', 'promotionsData.ts');

// Default promotions
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

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(PROMOTIONS_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load promotions from file
export function loadPromotionsFromFile(): Promotion[] {
  try {
    if (!fs.existsSync(PROMOTIONS_FILE_PATH)) {
      // Create file with default promotions
      savePromotionsToFile(DEFAULT_PROMOTIONS);
      return DEFAULT_PROMOTIONS;
    }
    
    const fileContent = fs.readFileSync(PROMOTIONS_FILE_PATH, 'utf8');
    
    // Parse TypeScript file content to extract promotions array
    const arrayMatch = fileContent.match(/export const promotionsData: Promotion\[\] = (\[[\s\S]*?\]);/);
    if (arrayMatch) {
      // Convert the string to a valid JSON array by removing TypeScript types and formatting
      const arrayString = arrayMatch[1]
        .replace(/(\w+):/g, '"$1":')  // Quote property names
        .replace(/"/g, '"')           // Normalize quotes
        .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
      
      return JSON.parse(arrayString) as Promotion[];
    }
    
    return DEFAULT_PROMOTIONS;
  } catch (error) {
    console.error('Error loading promotions from file:', error);
    return DEFAULT_PROMOTIONS;
  }
}

// Save promotions to file
export function savePromotionsToFile(promotions: Promotion[]): void {
  try {
    // Create TypeScript file content
    const fileContent = `interface Promotion {
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

export const promotionsData: Promotion[] = ${JSON.stringify(promotions, null, 2)};`;

    fs.writeFileSync(PROMOTIONS_FILE_PATH, fileContent, 'utf8');
    console.log('Promotions saved to TypeScript file successfully');
  } catch (error) {
    console.error('Error saving promotions to file:', error);
  }
}

// Find active promotion by code
export function findActivePromotion(code: string): Promotion | undefined {
  const promotions = loadPromotionsFromFile();
  return promotions.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
}

// Add new promotion
export function addPromotion(promotion: Promotion): boolean {
  try {
    const promotions = loadPromotionsFromFile();
    
    // Check if code already exists
    const existingPromo = promotions.find(p => p.code.toUpperCase() === promotion.code.toUpperCase());
    if (existingPromo) {
      return false; // Code already exists
    }
    
    promotions.push(promotion);
    savePromotionsToFile(promotions);
    return true;
  } catch (error) {
    console.error('Error adding promotion:', error);
    return false;
  }
}

// Update promotion
export function updatePromotion(id: string, updates: Partial<Promotion>): boolean {
  try {
    const promotions = loadPromotionsFromFile();
    const index = promotions.findIndex(p => p.id === id);
    
    if (index === -1) {
      return false; // Promotion not found
    }
    
    promotions[index] = { ...promotions[index], ...updates };
    savePromotionsToFile(promotions);
    return true;
  } catch (error) {
    console.error('Error updating promotion:', error);
    return false;
  }
}

// Delete promotion
export function deletePromotion(id: string): boolean {
  try {
    const promotions = loadPromotionsFromFile();
    const filteredPromotions = promotions.filter(p => p.id !== id);
    
    if (filteredPromotions.length === promotions.length) {
      return false; // Promotion not found
    }
    
    savePromotionsToFile(filteredPromotions);
    return true;
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return false;
  }
}