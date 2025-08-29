"use client";

import { Metadata } from "next";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ClaudeStyleInterface from "@/components/Chatbot/ClaudeStyleInterface";
import ProSubscriptionRequired from "@/components/Subscription/ProSubscriptionRequired";
import WhatsAppConfig from "@/components/WhatsApp/WhatsAppConfig";

// Get default chatbot ID - in production this would come from database
const DEFAULT_CHATBOT_ID = "cmepuxaoj0004kndw8g42uma8";

export default function ChatbotPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showWhatsAppConfig, setShowWhatsAppConfig] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d4ff]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  // Check if user has PRO subscription
  if (user.subscription !== "PRO") {
    return <ProSubscriptionRequired />;
  }

  // Check if subscription is still active
  if (user.subscriptionEndsAt && new Date() > new Date(user.subscriptionEndsAt)) {
    return <ProSubscriptionRequired expired={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      {/* Header */}
      <div className="bg-white dark:bg-boxdark shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🤖 Aranza Asistente Personal
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Tu asistente de IA disponible en la web y WhatsApp
              </p>
            </div>
            
            {/* WhatsApp Toggle Button */}
            <button
              onClick={() => setShowWhatsAppConfig(!showWhatsAppConfig)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Configurar WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showWhatsAppConfig && (
          <div className="mb-8">
            <WhatsAppConfig 
              onWhatsAppSaved={() => {
                setShowWhatsAppConfig(false);
              }}
            />
          </div>
        )}

        {/* Chat Interface */}
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm">
          <ClaudeStyleInterface chatbotId={DEFAULT_CHATBOT_ID} />
        </div>
      </div>
    </div>
  );
}