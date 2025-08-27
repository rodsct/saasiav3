// Temporary in-memory WhatsApp configuration
// This is used while database migration is pending

interface WhatsAppConfig {
  whatsappNumber: string;
  whatsappMessage: string;
  isWhatsappEnabled: boolean;
}

// In-memory storage (will reset on server restart)
let tempConfig: WhatsAppConfig = {
  whatsappNumber: process.env.WHATSAPP_NUMBER || "+5215512345678",
  whatsappMessage: process.env.WHATSAPP_MESSAGE || "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.",
  isWhatsappEnabled: process.env.WHATSAPP_ENABLED === 'true' || true,
};

export const getTempWhatsAppConfig = (): WhatsAppConfig => {
  return tempConfig;
};

export const setTempWhatsAppConfig = (config: Partial<WhatsAppConfig>): WhatsAppConfig => {
  tempConfig = {
    ...tempConfig,
    ...config,
  };
  console.log("Temp WhatsApp config updated:", tempConfig);
  return tempConfig;
};