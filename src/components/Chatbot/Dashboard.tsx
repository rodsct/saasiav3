"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Chatbot from "./index";
import { CHATBOT_MODELS } from "@/utils/chatbotModels";

interface ChatbotData {
  id: string;
  name: string;
  description?: string;
  model: string;
  n8nWebhookUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ChatbotDashboard() {
  const { data: session } = useSession();
  const [chatbots, setChatbots] = useState<ChatbotData[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<ChatbotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    model: "MODEL_A",
  });

  useEffect(() => {
    if (session?.user?.id) {
      loadChatbots();
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadChatbots = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/chatbot");
      const data = await response.json();
      
      if (response.ok) {
        setChatbots(data.chatbots);
        if (data.chatbots.length > 0 && !selectedChatbot) {
          setSelectedChatbot(data.chatbots[0]);
        }
      } else {
        toast.error("Error loading chatbots");
      }
    } catch (error) {
      toast.error("Error loading chatbots");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createChatbot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Chatbot created successfully!");
        setFormData({ name: "", description: "", model: "MODEL_A" });
        setShowCreateForm(false);
        loadChatbots();
      } else {
        toast.error(data.error || "Failed to create chatbot");
      }
    } catch (error) {
      toast.error("Failed to create chatbot");
      console.error("Error:", error);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">Please sign in to manage chatbots</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                My Chatbots
              </h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                New
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {chatbots.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No chatbots yet
              </div>
            ) : (
              chatbots.map((chatbot) => (
                <div
                  key={chatbot.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedChatbot?.id === chatbot.id ? "bg-blue-50 dark:bg-blue-900" : ""
                  }`}
                  onClick={() => setSelectedChatbot(chatbot)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {chatbot.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-0.5 rounded">
                          {CHATBOT_MODELS[chatbot.model]?.name || chatbot.model}
                        </span>
                      </div>
                      {chatbot.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {chatbot.description}
                        </p>
                      )}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${chatbot.isActive ? "bg-green-500" : "bg-red-500"}`}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {showCreateForm && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Chatbot
            </h4>
            
            <form onSubmit={createChatbot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter chatbot name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Model
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.values(CHATBOT_MODELS).map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Webhook: {CHATBOT_MODELS[formData.model]?.webhookUrl}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="lg:col-span-3">
        {selectedChatbot ? (
          <Chatbot
            chatbotId={selectedChatbot.id}
            chatbotName={selectedChatbot.name}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Chatbot Selected
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {chatbots.length === 0 
                  ? "Create your first chatbot to get started"
                  : "Select a chatbot from the list to start chatting"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}