import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { redirect } from "next/navigation";
import ChatbotDashboard from "@/components/Chatbot/Dashboard";

export const metadata: Metadata = {
  title: "Chatbot | Play SaaS",
  description: "Manage your AI chatbots with n8n integration",
};

export default async function ChatbotPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <section className="pb-[120px] pt-[120px]">
      <div className="container">
        <ChatbotDashboard />
      </div>
    </section>
  );
}