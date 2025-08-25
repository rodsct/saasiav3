"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import ClaudeStyleInterface from "./ClaudeStyleInterface";
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
  const { user } = useAuth();
  const [chatbots, setChatbots] = useState<ChatbotData[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<ChatbotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    model: "MODEL_A",
  });

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

  useEffect(() => {
    if (session?.user?.id) {
      loadChatbots();
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-create chatbot if none exists
  useEffect(() => {
    if (session?.user?.id && !isLoading && chatbots.length === 0) {
      const autoCreateChatbot = async () => {
        try {
          const response = await fetch("/api/chatbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "Aranza",
              description: "Asistente Virtual IA",
              model: "MODEL_A",
            }),
          });
          if (response.ok) {
            loadChatbots();
          }
        } catch (error) {
          console.error("Auto-create error:", error);
        }
      };
      autoCreateChatbot();
    }
  }, [session, isLoading, chatbots.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first chatbot and go directly to chat
  useEffect(() => {
    if (chatbots.length > 0 && !selectedChatbot) {
      setSelectedChatbot(chatbots[0]);
    }
  }, [chatbots, selectedChatbot]);

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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Inicia sesión para continuar
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Necesitas una cuenta para acceder a Aranza
          </p>
        </div>
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {selectedChatbot ? (
        <ClaudeStyleInterface chatbotId={selectedChatbot.id} />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-6">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium text-xl">A</span>
            </div>
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
              Hola, soy Aranza
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Tu asistente virtual de inteligencia artificial
            </p>
            {isLoading ? (
              <div className="w-6 h-6 mx-auto border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Comenzar conversación
              </button>
            )}
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
              Configurar Aranza
            </h2>
          
            <form onSubmit={createChatbot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="Aranza"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="Asistente virtual IA"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2.5 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}