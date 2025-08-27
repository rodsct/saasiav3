"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import WhatsAppSidebar from "@/components/WhatsApp/WhatsAppSidebar";
import WhatsAppMobileBanner from "@/components/WhatsApp/WhatsAppMobileBanner";

interface Message {
  id: string;
  content: string;
  isFromUser: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ChatbotProps {
  chatbotId: string;
}

export default function ClaudeStyleInterface({ chatbotId: initialChatbotId }: ChatbotProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [currentChatbotId, setCurrentChatbotId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
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
      initializeChatbot();
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && currentChatbotId) {
      loadConversations();
    }
  }, [user, currentChatbotId]);

  useEffect(() => {
    const checkScreenSize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const initializeChatbot = async () => {
    if (!user?.id) {
      console.log("No user ID available for chatbot initialization");
      return;
    }

    try {
      const response = await fetch(`/api/chatbot/user-chatbot?userId=${user.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error getting user chatbot:", response.status, errorData);
        return;
      }
      
      const data = await response.json();
      console.log("Chatbot initialized:", data.chatbot.id);
      setCurrentChatbotId(data.chatbot.id);
      
    } catch (error) {
      console.error("Error initializing chatbot:", error);
    }
  };

  const loadConversations = async () => {
    if (!currentChatbotId) {
      console.log("No chatbot ID available for loading conversations");
      return;
    }

    try {
      // Try simplified endpoint first, fallback to original
      let response = await fetch(`/api/chatbot/conversations-simple?chatbotId=${currentChatbotId}`);
      
      if (!response.ok || response.status === 404) {
        console.log("Simplified conversations endpoint not available, using fallback");
        response = await fetch(`/api/chatbot/conversations?chatbotId=${currentChatbotId}`);
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
      
      // Only load the latest conversation if we don't have a current conversation
      // This prevents overriding when user explicitly started a new chat
      if (data.conversations?.length > 0 && !currentConversation && messages.length === 0) {
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

  const reloadConversationsList = async () => {
    if (!currentChatbotId) return;

    try {
      let response = await fetch(`/api/chatbot/conversations-simple?chatbotId=${currentChatbotId}`);
      
      if (!response.ok || response.status === 404) {
        response = await fetch(`/api/chatbot/conversations?chatbotId=${currentChatbotId}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error reloading conversations list:", error);
    }
  };

  const createNewChat = () => {
    console.log("Starting new conversation for chatbot:", currentChatbotId);
    
    // Clear current conversation and messages to start fresh
    setCurrentConversation(null);
    setMessages([]);
    setInput("");
    
    console.log("New chat started - conversation cleared");
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
      // Try ultra simple endpoint first (zero dependencies)
      let response = await fetch("/api/chatbot/chat-ultra-simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chatbotId: currentChatbotId,
          conversationId: currentConversation?.id,
          userInfo: user ? {
            id: user.id,
            email: user.email,
            name: user.name,
            subscription: user.subscription
          } : null,
        }),
      });

      if (!response.ok || response.status === 404) {
        console.log("Ultra simple endpoint not available, trying direct");
        response = await fetch("/api/chatbot/chat-direct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            chatbotId: currentChatbotId,
            conversationId: currentConversation?.id,
          }),
        });
      }

      if (!response.ok || response.status === 404) {
        console.log("Direct endpoint not available, trying original");
        response = await fetch("/api/chatbot/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            chatbotId: currentChatbotId,
            conversationId: currentConversation?.id,
          }),
        });
      }

      if (!response.ok) {
        if (response.status === 500) {
          toast.error(t('chatbot.errors.server_error'));
        } else {
          toast.error(t('chatbot.errors.send_message'));
        }
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.error("Chat response is not JSON:", contentType, "Status:", response.status);
        toast.error(t('chatbot.errors.server_response'));
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      const data = await response.json();

      // If this was the first message (no current conversation), update conversation state
      if (!currentConversation?.id && data.conversationId) {
        const newConversation = {
          id: data.conversationId,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCurrentConversation(newConversation);
        
        // Generate automatic title for new conversation
        setTimeout(async () => {
          const generatedTitle = await generateTitle(data.conversationId);
          if (generatedTitle) {
            setCurrentConversation(prev => prev ? { ...prev, title: generatedTitle } : null);
          }
        }, 1000);
        
        // Reload conversations list to show new conversation in Recientes
        await reloadConversationsList();
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
      toast.error(t('chatbot.errors.send_message'));
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

  const generateTitle = async (conversationId: string) => {
    try {
      const response = await fetch("/api/chatbot/conversation-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.title;
      }
    } catch (error) {
      console.error("Error generating title:", error);
    }
    return null;
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chatbot/conversation-actions?conversationId=${conversationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        
        // If deleting current conversation, start new chat
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
          setMessages([]);
        }
        
        toast.success("Conversación eliminada");
      } else {
        toast.error("Error al eliminar conversación");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Error al eliminar conversación");
    }
  };

  const updateConversationTitle = async (conversationId: string, newTitle: string) => {
    try {
      const response = await fetch("/api/chatbot/conversation-title", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, title: newTitle }),
      });

      if (response.ok) {
        setConversations(prev => prev.map(c => 
          c.id === conversationId ? { ...c, title: newTitle } : c
        ));
        
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(prev => prev ? { ...prev, title: newTitle } : null);
        }
        
        toast.success("Título actualizado");
        return true;
      } else {
        toast.error("Error al actualizar título");
        return false;
      }
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Error al actualizar título");
      return false;
    }
  };

  const handleTitleEdit = async (conversationId: string) => {
    if (editingTitle.trim()) {
      const success = await updateConversationTitle(conversationId, editingTitle.trim());
      if (success) {
        setEditingConversationId(null);
        setEditingTitle("");
      }
    } else {
      setEditingConversationId(null);
      setEditingTitle("");
    }
  };

  const startEditingTitle = (conversation: Conversation) => {
    setEditingConversationId(conversation.id);
    setEditingTitle(conversation.title || getConversationDisplayTitle(conversation));
  };

  const getConversationDisplayTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    return conversation.messages?.[0]?.content.slice(0, 30) || 'Nueva conversación';
  };

  const groupConversationsByDate = (conversations: Conversation[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const groups = {
      today: [] as Conversation[],
      yesterday: [] as Conversation[],
      thisWeek: [] as Conversation[],
      thisMonth: [] as Conversation[],
      older: [] as Conversation[]
    };

    conversations.forEach(conv => {
      const date = new Date(conv.updatedAt || conv.createdAt);
      
      if (date >= today) {
        groups.today.push(conv);
      } else if (date >= yesterday) {
        groups.yesterday.push(conv);
      } else if (date >= weekAgo) {
        groups.thisWeek.push(conv);
      } else if (date >= monthAgo) {
        groups.thisMonth.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] text-white overflow-hidden relative"
         style={{ height: 'calc(100vh - 80px)' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80 max-w-[85vw] sm:max-w-[70vw] lg:max-w-none' : 'w-0 lg:w-16'} bg-[#0a0a0a]/95 border-r border-[#00d4ff]/20 backdrop-blur-xl transition-all duration-300 flex flex-col ${sidebarOpen ? 'fixed lg:relative inset-y-0 left-0 z-40' : 'overflow-hidden'}`}>
        {/* Header */}
        <div className="p-3 lg:p-4 border-b border-[#00d4ff]/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-base lg:text-lg font-semibold text-white truncate">{t('chatbot.chats')}</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 lg:p-2 hover:bg-[#3f3f3f] rounded-lg transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Chat Section */}
        <div className="p-3 lg:p-4">
          {/* New Chat Button */}
          <button
            onClick={createNewChat}
            className={`w-full flex items-center justify-center space-x-2 py-2 lg:py-3 px-2 lg:px-4 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#0099cc] hover:to-[#007acc] rounded-lg transition-all duration-300 shadow-lg shadow-[#00d4ff]/20 ${!sidebarOpen ? 'px-2' : ''}`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium truncate">{t('chatbot.new_chat')}</span>}
          </button>
        </div>

        {/* WhatsApp Section */}
        {sidebarOpen && <WhatsAppSidebar />}

        {/* Conversations List */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 lg:px-4 py-2">
              {conversations.length > 0 ? (
                (() => {
                  const groups = groupConversationsByDate(conversations);
                  const sections = [
                    { key: 'today', title: 'Hoy', conversations: groups.today },
                    { key: 'yesterday', title: 'Ayer', conversations: groups.yesterday },
                    { key: 'thisWeek', title: 'Esta semana', conversations: groups.thisWeek },
                    { key: 'thisMonth', title: 'Este mes', conversations: groups.thisMonth },
                    { key: 'older', title: 'Más antiguas', conversations: groups.older }
                  ];

                  return sections.map(section => 
                    section.conversations.length > 0 && (
                      <div key={section.key} className="mb-6">
                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                          {section.title}
                        </h3>
                        <div className="space-y-1">
                          {section.conversations.map((conversation) => (
                            <div
                              key={conversation.id}
                              className={`group relative rounded-lg transition-all duration-300 hover:bg-[#00d4ff]/20 border border-transparent hover:border-[#00d4ff]/30 ${
                                currentConversation?.id === conversation.id ? 'bg-[#00d4ff]/20 border-[#00d4ff]/30' : ''
                              }`}
                            >
                              <button
                                onClick={() => selectConversation(conversation)}
                                className="w-full text-left p-2 lg:p-3"
                              >
                                {editingConversationId === conversation.id ? (
                                  <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onBlur={() => handleTitleEdit(conversation.id)}
                                    onKeyDown={(e) => {
                                      e.stopPropagation();
                                      if (e.key === 'Enter') {
                                        handleTitleEdit(conversation.id);
                                      } else if (e.key === 'Escape') {
                                        setEditingConversationId(null);
                                        setEditingTitle("");
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full bg-[#1a1a2e] text-white text-xs lg:text-sm px-2 py-1 rounded border border-[#00d4ff]/50 focus:outline-none focus:border-[#00d4ff]"
                                    autoFocus
                                  />
                                ) : (
                                  <>
                                    <div className="text-xs lg:text-sm text-white truncate pr-6">
                                      {getConversationDisplayTitle(conversation)}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {new Date(conversation.updatedAt || conversation.createdAt).toLocaleDateString()}
                                    </div>
                                  </>
                                )}
                              </button>
                              
                              {/* Action buttons */}
                              {editingConversationId !== conversation.id && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditingTitle(conversation);
                                      }}
                                      className="p-1 hover:bg-[#3f3f3f] rounded text-gray-400 hover:text-white transition-colors"
                                      title="Renombrar"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
                                          deleteConversation(conversation.id);
                                        }
                                      }}
                                      className="p-1 hover:bg-red-600/20 rounded text-gray-400 hover:text-red-400 transition-colors"
                                      title="Eliminar"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  );
                })()
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-xs">No hay conversaciones aún</p>
                  <p className="text-xs mt-1">¡Empieza un nuevo chat!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Info */}
        {sidebarOpen && user && (
          <div className="p-3 lg:p-4 border-t border-[#00d4ff]/20 flex-shrink-0">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-xs lg:text-sm">
                  {user.name?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs lg:text-sm font-medium text-white truncate">
                  {user.name || t('chatbot.user')}
                </div>
                <div className="text-xs text-gray-400">
                  {t('chatbot.pro_plan')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
        {/* Mobile WhatsApp Banner */}
        <WhatsAppMobileBanner />
        
        {/* Welcome Message */}
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-2xl mx-auto">
              <div className="mb-6 lg:mb-8">
                <div className="inline-block p-3 lg:p-4 bg-[#ff6b35] rounded-2xl mb-4">
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                  </svg>
                </div>
                <div className="text-xl lg:text-3xl font-medium text-white mb-3 lg:mb-4">
                  {t('chatbot.welcome')}
                </div>
                <p className="text-base lg:text-lg text-gray-400">
                  {t('chatbot.welcome_question')}
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <button
                  onClick={() => setInput(t('chatbot.quick_actions.services_question'))}
                  className="p-3 lg:p-4 bg-[#3f3f3f] hover:bg-[#4f4f4f] rounded-xl transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white mb-1">{t('chatbot.quick_actions.services')}</div>
                  <div className="text-xs text-gray-400">{t('chatbot.quick_actions.services_desc')}</div>
                </button>
                <button
                  onClick={() => setInput(t('chatbot.quick_actions.consulting_question'))}
                  className="p-3 lg:p-4 bg-[#3f3f3f] hover:bg-[#4f4f4f] rounded-xl transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white mb-1">{t('chatbot.quick_actions.consulting')}</div>
                  <div className="text-xs text-gray-400">{t('chatbot.quick_actions.consulting_desc')}</div>
                </button>
                <button
                  onClick={() => setInput(t('chatbot.quick_actions.about_question'))}
                  className="p-3 lg:p-4 bg-[#3f3f3f] hover:bg-[#4f4f4f] rounded-xl transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white mb-1">{t('chatbot.quick_actions.about')}</div>
                  <div className="text-xs text-gray-400">{t('chatbot.quick_actions.about_desc')}</div>
                </button>
                <button
                  onClick={() => setInput(t('chatbot.quick_actions.contact_question'))}
                  className="p-3 lg:p-4 bg-[#3f3f3f] hover:bg-[#4f4f4f] rounded-xl transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white mb-1">{t('chatbot.quick_actions.contact')}</div>
                  <div className="text-xs text-gray-400">{t('chatbot.quick_actions.contact_desc')}</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Messages Area */
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto py-3 lg:py-8">
              {messages.map((message) => (
                <div key={message.id} className="mb-4 lg:mb-6 px-3 lg:px-6">
                  <div className="flex items-start space-x-3 lg:space-x-4">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                      {message.isFromUser ? (
                        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-[#00d4ff] to-[#0099cc] rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium text-xs lg:text-sm">
                            {user?.name?.[0] || 'U'}
                          </span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-[#1a1a2e] border border-[#00d4ff]/30 rounded-lg flex items-center justify-center">
                          <span className="text-[#00d4ff] font-medium text-xs lg:text-sm">A</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-100 text-sm lg:text-base">
                        {message.isFromUser ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-3 lg:mb-4 last:mb-0 leading-relaxed">{children}</p>,
                              code: ({ children }) => (
                                <code className="bg-[#1e1e1e] px-1 lg:px-1.5 py-0.5 lg:py-1 rounded text-xs lg:text-sm font-mono text-green-400">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-[#1e1e1e] p-3 lg:p-4 rounded-lg overflow-x-auto my-3 lg:my-4 border border-[#3f3f3f]">
                                  <code className="text-green-400 font-mono text-xs lg:text-sm">{children}</code>
                                </pre>
                              ),
                              ul: ({ children }) => <ul className="list-disc list-inside mb-3 lg:mb-4 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-3 lg:mb-4 space-y-1">{children}</ol>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-[#ff6b35] pl-3 lg:pl-4 italic my-3 lg:my-4 text-gray-300">
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
                <div className="mb-6 lg:mb-8 px-3 lg:px-6">
                  <div className="flex items-start space-x-3 lg:space-x-4">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-[#1a1a2e] border border-[#00d4ff]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-[#00d4ff] font-medium text-xs lg:text-sm">A</span>
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
        <div className="border-t border-[#3f3f3f] bg-[#2f2f2f] flex-shrink-0">
          <div className="max-w-4xl mx-auto p-3 lg:p-6">
            <div className="relative">
              <div className="bg-[#3f3f3f] rounded-xl lg:rounded-2xl border border-[#4f4f4f] overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder={t('chatbot.placeholder')}
                  rows={1}
                  className="w-full resize-none bg-transparent px-3 lg:px-4 py-3 lg:py-4 pr-12 lg:pr-16 text-sm lg:text-base text-white placeholder-gray-400 focus:outline-none"
                  style={{ 
                    minHeight: '48px',
                    maxHeight: '160px',
                  }}
                />
                
                {/* Send Button */}
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 p-1.5 lg:p-2 rounded-lg bg-[#ff6b35] hover:bg-[#e55a2b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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