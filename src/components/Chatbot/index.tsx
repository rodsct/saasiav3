"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  content: string;
  isFromUser: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  messages: Message[];
}

interface ChatbotProps {
  chatbotId: string;
  chatbotName: string;
}

export default function Chatbot({ chatbotId, chatbotName }: ChatbotProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (session?.user?.id) {
      loadConversations();
    }
  }, [session, chatbotId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadConversations = async () => {
    try {
      const response = await fetch(`/api/chatbot/conversations?chatbotId=${chatbotId}`);
      const data = await response.json();
      
      if (data.conversations && data.conversations.length > 0) {
        const latestConversation = data.conversations[0];
        setConversationId(latestConversation.id);
        setMessages(latestConversation.messages);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: userMessage,
      isFromUser: true,
      createdAt: new Date().toISOString(),
    }]);

    try {
      const response = await fetch("/api/chatbot/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatbotId,
          message: userMessage,
          conversationId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConversationId(data.conversationId);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isFromUser: false,
          createdAt: new Date().toISOString(),
        }]);
      } else {
        toast.error("Error sending message");
      }
    } catch (error) {
      toast.error("Error sending message");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">Please sign in to use the chatbot</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.89 21 5 21H11V19.5L19 12.5V11H21V9M20 15L18 17H22L20 15M16 21L14 23H18L16 21Z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold">
              {chatbotName}
            </h3>
            <p className="text-white/80 text-sm">Asistente Virtual IA</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">En línea</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3C16.97 3 21 6.58 21 11C21 15.42 16.97 19 12 19C10.27 19 8.64 18.38 7.32 17.34L3 18L4.9 14.36C3.71 13.07 3 11.58 3 10C3 5.58 7.03 2 12 2M12 1C6.48 1 2 5.03 2 10C2 11.8 2.61 13.43 3.64 14.75L2 22L9.25 20.36C10.57 21.39 12.2 22 14 22C19.52 22 24 17.97 24 12.5C24 6.03 19.52 1 14 1H12Z"/>
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¡Hola! Soy Aranza</h4>
            <p className="text-gray-600 dark:text-gray-400">Tu asistente virtual de IA. ¿En qué puedo ayudarte hoy?</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isFromUser ? "justify-end" : "justify-start"} items-end space-x-2`}
            >
              {!message.isFromUser && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-1 flex-shrink-0">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-lg ${
                  message.isFromUser
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.isFromUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.isFromUser && (
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-1 flex-shrink-0">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start items-end space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-1 flex-shrink-0">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div className="bg-white dark:bg-gray-700 px-5 py-3 rounded-2xl rounded-bl-md shadow-lg border border-gray-200 dark:border-gray-600">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aranza está escribiendo...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje a Aranza..."
              className="w-full resize-none rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-0 transition-all duration-200"
              rows={1}
              disabled={isLoading}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <div className="absolute right-3 bottom-3 text-xs text-gray-400">
              {input.length}/1000
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z"/>
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Presiona Enter para enviar • Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}