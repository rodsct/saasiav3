"use client";

import { Metadata } from "next";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ClaudeStyleInterface from "@/components/Chatbot/ClaudeStyleInterface";
import ProSubscriptionRequired from "@/components/Subscription/ProSubscriptionRequired";

// Get default chatbot ID - in production this would come from database
const DEFAULT_CHATBOT_ID = "cmepuxaoj0004kndw8g42uma8";

export default function ChatbotPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
    <ClaudeStyleInterface chatbotId={DEFAULT_CHATBOT_ID} />
  );
}