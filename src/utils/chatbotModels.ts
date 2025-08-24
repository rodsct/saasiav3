export interface ChatbotModelConfig {
  id: string;
  name: string;
  description: string;
  webhookUrl: string;
}

export const CHATBOT_MODELS: Record<string, ChatbotModelConfig> = {
  MODEL_A: {
    id: "MODEL_A",
    name: "Aranza IA",
    description: "Asistente virtual inteligente de Aranza.io",
    webhookUrl: "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3"
  }
};

export function getWebhookUrlForModel(model: string): string {
  return CHATBOT_MODELS[model]?.webhookUrl || CHATBOT_MODELS.MODEL_A.webhookUrl;
}