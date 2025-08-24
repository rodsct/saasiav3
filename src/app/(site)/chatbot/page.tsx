import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { redirect } from "next/navigation";
import ChatbotDashboard from "@/components/Chatbot/Dashboard";

export const metadata: Metadata = {
  title: "Aranza - Asistente Virtual IA | Aranza.io",
  description: "Interactúa con Aranza, nuestro asistente virtual de inteligencia artificial. Chatea y obtén respuestas inteligentes a todas tus consultas.",
};

export default async function ChatbotPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-12">
      <div className="container mx-auto px-4">
        <ChatbotDashboard />
      </div>
    </section>
  );
}