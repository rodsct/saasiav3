export interface ChatbotModelConfig {
  id: string;
  name: string;
  description: string;
  webhookUrl: string;
}

export const CHATBOT_MODELS: Record<string, ChatbotModelConfig> = {
  MODEL_A: {
    id: "MODEL_A",
    name: "Model A - Test",
    description: "Testing model with experimental features",
    webhookUrl: "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook-test/saasiav3"
  },
  MODEL_B: {
    id: "MODEL_B", 
    name: "Model B - Standard",
    description: "Standard conversation model for general use",
    webhookUrl: "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/modelob"
  },
  MODEL_C: {
    id: "MODEL_C",
    name: "Model C - Advanced", 
    description: "Advanced AI model with enhanced capabilities",
    webhookUrl: "https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/modeloc"
  }
};

export function getWebhookUrlForModel(model: string): string {
  return CHATBOT_MODELS[model]?.webhookUrl || CHATBOT_MODELS.MODEL_A.webhookUrl;
}