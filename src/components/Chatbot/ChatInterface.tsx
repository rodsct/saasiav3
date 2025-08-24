"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

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

interface ChatInterfaceProps {
  chatbotId: string;
}

export default function ChatInterface({ chatbotId }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  }, [session, chatbotId]);

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

    // Ajustar altura del textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Agregar mensaje del usuario
    const userMsg = {
      id: Date.now().toString(),
      content: userMessage,
      isFromUser: true,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

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
        toast.error("Error enviando mensaje");
      }
    } catch (error) {
      toast.error("Error enviando mensaje");
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

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.89 21 5 21H11V19.5L19 12.5V11H21V9"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Acceso Requerido
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Inicia sesión para chatear con Aranza
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Aranza
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Asistente de IA
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.89 21 5 21H11V19.5L19 12.5V11H21V9"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Hola! Soy Aranza
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                Tu asistente de inteligencia artificial. Puedo ayudarte con preguntas, análisis, 
                escritura y mucho más. ¿En qué puedo asistirte hoy?
              </p>
            </div>
          ) : (
            <div className="py-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`mb-6 ${message.isFromUser ? 'ml-auto' : ''}`}
                >
                  <div className="flex items-start space-x-4 px-6">
                    {!message.isFromUser && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-xs">A</span>
                      </div>
                    )}
                    
                    <div className={`flex-1 ${message.isFromUser ? 'text-right' : ''}`}>
                      {message.isFromUser && (
                        <div className="flex justify-end mb-1">
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-gray-700 dark:text-gray-300 font-bold text-xs">
                              {session?.user?.name?.[0] || 'U'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className={`prose prose-gray dark:prose-invert max-w-none ${
                        message.isFromUser 
                          ? 'bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-br-md px-4 py-3 inline-block max-w-lg ml-auto' 
                          : ''
                      }`}>
                        {message.isFromUser ? (
                          <p className="m-0 text-gray-900 dark:text-white">{message.content}</p>
                        ) : (
                          <ReactMarkdown
                            className="text-gray-900 dark:text-white"
                            components={{
                              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                              code: ({ children, className }) => (
                                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                  {children}
                                </pre>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        )}
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(message.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="mb-6">
                  <div className="flex items-start space-x-4 px-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-xs">A</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Aranza está escribiendo...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto p-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje a Aranza..."
              className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 min-h-[50px] max-h-[200px]"
              style={{ height: "50px" }}
              disabled={isLoading}
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Aranza puede cometer errores. Considera verificar información importante.
          </p>
        </div>
      </div>
    </div>
  );
}