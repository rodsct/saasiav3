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
      
      if (response.ok && data.conversations.length > 0) {
        const conversation = data.conversations[0];
        setConversationId(conversation.id);
        setMessages(conversation.messages);
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

    const tempUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      isFromUser: true,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chatbotId,
          conversationId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!conversationId) {
          setConversationId(data.conversationId);
        }

        const botMessage: Message = {
          id: data.messageId,
          content: data.content,
          isFromUser: false,
          createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        toast.error("Error al enviar mensaje");
        setMessages(prev => prev.slice(0, -1));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error al enviar mensaje");
      setMessages(prev => prev.slice(0, -1));
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
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Inicia sesión
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Necesitas una cuenta para chatear con Aranza
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-lg mx-auto px-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-gray-700 dark:text-gray-300 font-medium">A</span>
              </div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                ¿En qué puedo ayudarte?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Haz cualquier pregunta para comenzar
              </p>
            </div>
          </div>
        ) : (
          <div className="py-6">
            {messages.map((message) => (
              <div key={message.id} className="mb-6 px-6">
                <div className="flex items-start space-x-3 max-w-4xl mx-auto">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    {message.isFromUser ? (
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                          {session?.user?.name?.[0] || 'U'}
                        </span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">A</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 dark:text-white">
                      {message.isFromUser ? (
                        <p>{message.content}</p>
                      ) : (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                            code: ({ children }) => (
                              <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">
                                {children}
                              </pre>
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
              <div className="mb-6 px-6">
                <div className="flex items-start space-x-3 max-w-4xl mx-auto">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">A</span>
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
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-6">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              rows={1}
              className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent"
              style={{ 
                minHeight: '44px',
                maxHeight: '200px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}