import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { redirect } from "next/navigation";
import ClaudeStyleInterface from "@/components/Chatbot/ClaudeStyleInterface";
import ProSubscriptionRequired from "@/components/Subscription/ProSubscriptionRequired";

export const metadata: Metadata = {
  title: "Aranza - Asistente Virtual IA | Aranza.io",
  description: "Interactúa con Aranza, nuestro asistente virtual de inteligencia artificial. Chatea y obtén respuestas inteligentes a todas tus consultas.",
};

// Get default chatbot ID - in production this would come from database
const DEFAULT_CHATBOT_ID = "cmepuxaoj0004kndw8g42uma8";

export default async function ChatbotPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const user = session.user as any;
  
  // Check if user has PRO subscription
  if (user.subscription !== "PRO") {
    return <ProSubscriptionRequired />;
  }

  // Check if subscription is still active
  if (user.subscriptionEndsAt && new Date() > new Date(user.subscriptionEndsAt)) {
    return <ProSubscriptionRequired expired={true} />;
  }

  return <ClaudeStyleInterface chatbotId={DEFAULT_CHATBOT_ID} />;
}