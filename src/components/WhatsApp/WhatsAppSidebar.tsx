"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function WhatsAppSidebar() {
  const { user } = useAuth();
  const [whatsapp, setWhatsapp] = useState("");
  const [currentWhatsApp, setCurrentWhatsApp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (user?.subscription === "PRO") {
      fetchCurrentWhatsApp();
    }
  }, [user]);

  const fetchCurrentWhatsApp = async () => {
    try {
      const response = await fetch("/api/user/whatsapp");
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const data = await response.json();
          setCurrentWhatsApp(data.whatsapp);
          if (data.whatsapp) {
            setWhatsapp(data.whatsapp);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching WhatsApp:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!whatsapp.trim()) {
      toast.error("Ingresa tu número de WhatsApp");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/user/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ whatsapp: whatsapp.trim() }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.error("WhatsApp setup response is not JSON:", contentType);
        toast.error("Error del servidor. Intenta nuevamente.");
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setCurrentWhatsApp(data.whatsapp);
        toast.success("WhatsApp conectado! 📱");
        setIsExpanded(false);
      } else {
        toast.error(data.error || "Error al configurar WhatsApp");
      }
    } catch (error) {
      console.error("WhatsApp setup error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.subscription !== "PRO") {
    return null;
  }

  return (
    <div className="border-t border-[#00d4ff]/20 p-3 lg:p-4">
      <div className="space-y-3">
        {/* WhatsApp Header */}
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-[#1a1a2e]/30 rounded-lg p-2 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-medium text-white">WhatsApp</h3>
              {currentWhatsApp ? (
                <span className="text-xs text-green-400">Conectado</span>
              ) : (
                <span className="text-xs text-gray-400">No conectado</span>
              )}
            </div>
          </div>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* WhatsApp Content */}
        {isExpanded && (
          <div className="space-y-3 bg-[#1a1a2e]/30 rounded-lg p-3">
            {currentWhatsApp ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Número:</span>
                  <span className="text-green-400 font-mono">{currentWhatsApp}</span>
                </div>
                <p className="text-xs text-green-300">
                  ✅ Puedes chatear por WhatsApp
                </p>
                <button
                  onClick={() => {
                    setCurrentWhatsApp(null);
                    setWhatsapp("");
                    toast.success("WhatsApp desconectado");
                  }}
                  className="w-full text-xs text-red-400 hover:text-red-300 py-1"
                >
                  Desvincular
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-300">
                  Conecta WhatsApp para usar el agente desde tu teléfono
                </p>
                <form onSubmit={handleSubmit} className="space-y-2">
                  <div className="relative">
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full text-xs bg-[#0a0a0a]/50 border border-[#00d4ff]/30 rounded px-2 py-1.5 text-white placeholder-gray-500 focus:border-[#00d4ff] focus:outline-none"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !whatsapp.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 rounded transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                        </svg>
                        <span>Conectar</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}