"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
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
  createdAt: string;
}

interface ChatbotProps {
  chatbotId: string;
}

export default function ClaudeStyleInterface({ chatbotId }: ChatbotProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user, chatbotId]);

  const loadConversations = async () => {
    try {
      // Try simplified endpoint first, fallback to original
      let response = await fetch(`/api/chatbot/conversations-simple?chatbotId=${chatbotId}`);
      
      if (!response.ok || response.status === 404) {
        console.log("Simplified conversations endpoint not available, using fallback");
        response = await fetch(`/api/chatbot/conversations?chatbotId=${chatbotId}`);
      }
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized access to conversations");
          return;
        }
        if (response.status === 404) {
          console.log("Chatbot not found or no conversations");
          return;
        }
        if (response.status === 500) {
          console.error("Server error loading conversations - retrying later");
          return;
        }
        console.error("Error loading conversations:", response.status);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.error("Response is not JSON:", contentType);
        return;
      }

      const data = await response.json();
      setConversations(data.conversations || []);
      if (data.conversations?.length > 0) {
        const latest = data.conversations[0];
        setCurrentConversation(latest);
        setMessages(latest.messages || []);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      if (error.message?.includes("500")) {
        toast.error("Server error loading conversations. Check if chatbot exists in database.");
      } else {
        toast.error(`Error loading conversations: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const createNewChat = async () => {
    setCurrentConversation(null);
    setMessages([]);
    setInput("");
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    const tempUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      isFromUser: true,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempUserMessage]);

    try {
      // Try direct endpoint (no auth dependencies), then simplified, then original
      let response = await fetch("/api/chatbot/chat-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chatbotId,
          conversationId: currentConversation?.id,
        }),
      });

      if (!response.ok || response.status === 404) {
        console.log("Direct chat endpoint not available, trying simplified");
        response = await fetch("/api/chatbot/chat-simple", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            chatbotId,
            conversationId: currentConversation?.id,
          }),
        });
      }

      if (!response.ok || response.status === 404) {
        console.log("Simplified chat endpoint not available, using original");
        response = await fetch("/api/chatbot/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            chatbotId,
            conversationId: currentConversation?.id,
          }),
        });
      }

      if (!response.ok) {
        if (response.status === 500) {
          toast.error("Error del servidor - intenta más tarde");
        } else {
          toast.error("Error al enviar mensaje");
        }
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.error("Chat response is not JSON:", contentType, "Status:", response.status);
        toast.error("Error en respuesta del servidor");
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      const data = await response.json();

      if (!currentConversation?.id) {
        await loadConversations();
      }

      const botMessage: Message = {
        id: data.messageId,
        content: data.content,
        isFromUser: false,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error al enviar mensaje");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setMessages(conversation.messages || []);
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] bg-[#2f2f2f] text-white rounded-lg overflow-hidden"
         style={{ height: 'calc(100vh - 120px)' }}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-[#1e1e1e] border-r border-[#3f3f3f] transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-[#3f3f3f]">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-lg font-semibold text-white">Aranza</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#3f3f3f] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation & New Chat */}
        <div className="p-4 space-y-3">
          {/* Navigation Links */}
          <div className={`space-y-2 mb-4 ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
            <Link
              href="/"
              className={`${sidebarOpen ? 'w-full flex items-center space-x-3 py-2 px-3' : 'p-3'} text-gray-300 hover:text-white hover:bg-[#3f3f3f] rounded-lg transition-colors`}
              title="Inicio"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {sidebarOpen && <span className="text-sm">Inicio</span>}
            </Link>
            <Link
              href="/downloads"
              className={`${sidebarOpen ? 'w-full flex items-center space-x-3 py-2 px-3' : 'p-3'} text-gray-300 hover:text-white hover:bg-[#3f3f3f] rounded-lg transition-colors`}
              title="Descargas"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {sidebarOpen && <span className="text-sm">Descargas</span>}
            </Link>
          </div>

          {/* New Chat Button */}
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#3f3f3f] hover:bg-[#4f4f4f] rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Nuevo chat</span>}
          </button>
        </div>

        {/* Conversations List */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Recientes
              </h3>
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => selectConversation(conversation)}
                    className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-[#3f3f3f] ${
                      currentConversation?.id === conversation.id ? 'bg-[#3f3f3f]' : ''
                    }`}
                  >
                    <div className="text-sm text-white truncate">
                      {conversation.messages?.[0]?.content.slice(0, 40) || "Nueva conversación"}...
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(conversation.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Info */}
        {sidebarOpen && user && (
          <div className="p-4 border-t border-[#3f3f3f]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#ff6b35] rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.name?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  {user.name || 'Usuario'}
                </div>
                <div className="text-xs text-gray-400">
                  Plan Pro
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Welcome Message */}
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto px-6">
              <div className="mb-8">
                <div className="inline-block p-4 bg-[#ff6b35] rounded-2xl mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                  </svg>
                </div>
                <div className="text-3xl font-medium text-white mb-4">
                  <span className="text-[#ff6b35]">¡</span>Rodrigo ha vuelto<span className="text-[#ff6b35]">!</span>
                </div>
                <p className="text-lg text-gray-400">
                  ¿Cómo puedo ayudarte hoy?
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setInput("¿Qué servicios de IA ofrecen?")}
                  className="p-4 bg-[#3f3f3f] hover:bg-[#4f4f4f] rounded-xl transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white mb-1">Servicios</div>
                  <div className="text-xs text-gray-400">Conoce nuestros servicios de IA</div>
                </button>
                <button
                  onClick={() => setInput("¿Cómo pueden ayudarme con mi negocio?")}
                  className="p-4 bg-[#3f3f3f] hover:bg-[#4f4f4f] rounded-xl transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white mb-1">Consultoría</div>
                  <div className="text-xs text-gray-400">Soluciones para tu empresa</div>
                </button>
                <button
                  onClick={() => setInput("¿Qué es Aranza.io?")}
                  className="p-4 bg-[#3f3f3f] hover:bg-[#4f4f4f] rounded-xl transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white mb-1">Sobre Aranza</div>
                  <div className="text-xs text-gray-400">Conoce nuestra agencia</div>
                </button>
                <button
                  onClick={() => setInput("¿Cómo puedo contactarlos?")}
                  className="p-4 bg-[#3f3f3f] hover:bg-[#4f4f4f] rounded-xl transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white mb-1">Contacto</div>
                  <div className="text-xs text-gray-400">Ponte en contacto</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Messages Area */
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto py-8">
              {messages.map((message) => (
                <div key={message.id} className="mb-8 px-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                      {message.isFromUser ? (
                        <div className="w-8 h-8 bg-[#ff6b35] rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user?.name?.[0] || 'U'}
                          </span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-[#4f4f4f] rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium text-sm">A</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-100">
                        {message.isFromUser ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                              code: ({ children }) => (
                                <code className="bg-[#1e1e1e] px-1.5 py-1 rounded text-sm font-mono text-green-400">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-[#1e1e1e] p-4 rounded-lg overflow-x-auto my-4 border border-[#3f3f3f]">
                                  <code className="text-green-400 font-mono text-sm">{children}</code>
                                </pre>
                              ),
                              ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-[#ff6b35] pl-4 italic my-4 text-gray-300">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="mb-8 px-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#4f4f4f] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">A</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-[#3f3f3f] bg-[#2f2f2f]">
          <div className="max-w-4xl mx-auto p-6">
            <div className="relative">
              <div className="bg-[#3f3f3f] rounded-2xl border border-[#4f4f4f] overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="¿Cómo puedo ayudarte hoy?"
                  rows={1}
                  className="w-full resize-none bg-transparent px-4 py-4 pr-16 text-white placeholder-gray-400 focus:outline-none"
                  style={{ 
                    minHeight: '56px',
                    maxHeight: '200px',
                  }}
                />
                
                {/* Send Button */}
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg bg-[#ff6b35] hover:bg-[#e55a2b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}