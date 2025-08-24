"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ChatInterface from "./ChatInterface";
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
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.89 21 5 21H11V19.5L19 12.5V11H21V9M20 15L18 17H22L20 15M16 21L14 23H18L16 21Z"/>
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Aranza - Asistente Virtual IA
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Interactúa con nuestro asistente de inteligencia artificial diseñado para ayudarte en todas tus consultas
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        {chatbots.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.89 21 5 21H11V19.5L19 12.5V11H21V9"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Crea tu primera conversación con Aranza
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comienza a interactuar con nuestro asistente virtual de IA
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Iniciar Chat con Aranza
            </button>
          </div>
        ) : (
          chatbots.map((chatbot) => (
            <div key={chatbot.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {chatbot.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${chatbot.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {chatbot.isActive ? "Activo" : "Inactivo"}
                      </span>
                      <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-3 py-1 rounded-full">
                        {CHATBOT_MODELS[chatbot.model]?.name || chatbot.model}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedChatbot(chatbot)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl font-medium shadow-lg transition-all duration-200"
                >
                  Chatear
                </button>
              </div>
              {chatbot.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {chatbot.description}
                </p>
              )}
            </div>
          ))
        )}

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Configurar Aranza
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

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl mb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white">Aranza IA</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Modelo único disponible</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Webhook: https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200"
                  >
                    Crear Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {selectedChatbot && (
          <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedChatbot.name}
              </h2>
              <button
                onClick={() => setSelectedChatbot(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100vh-73px)]">
              <ChatInterface chatbotId={selectedChatbot.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}