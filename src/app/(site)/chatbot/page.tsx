import { Metadata } from "next";
import ClaudeStyleInterface from "@/components/Chatbot/ClaudeStyleInterface";

export const metadata: Metadata = {
  title: "Aranza - Asistente Virtual IA | Aranza.io",
  description: "Interactúa con Aranza, nuestro asistente virtual de inteligencia artificial. Chatea y obtén respuestas inteligentes a todas tus consultas.",
};

// Get default chatbot ID - in production this would come from database
const DEFAULT_CHATBOT_ID = "cmepuxaoj0004kndw8g42uma8";

export default function ChatbotPage() {
  return <ClaudeStyleInterface chatbotId={DEFAULT_CHATBOT_ID} />;
}