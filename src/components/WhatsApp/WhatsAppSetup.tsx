"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function WhatsAppSetup() {
  const { user } = useAuth();
  const [whatsapp, setWhatsapp] = useState("");
  const [currentWhatsApp, setCurrentWhatsApp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

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
        } else {
          console.error("WhatsApp fetch response is not JSON:", contentType);
        }
      }
    } catch (error) {
      console.error("Error fetching WhatsApp:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!whatsapp.trim()) {
      toast.error("Por favor ingresa tu número de WhatsApp");
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
        toast.success("¡WhatsApp configurado exitosamente! Pronto recibirás un mensaje de confirmación.");
      } else {
        toast.error(data.error || "Error al configurar WhatsApp");
      }
    } catch (error) {
      console.error("WhatsApp setup error:", error);
      toast.error("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeWhatsApp = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/user/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ whatsapp: "" }),
      });

      if (response.ok) {
        setCurrentWhatsApp(null);
        setWhatsapp("");
        toast.success("WhatsApp desvinculado exitosamente");
      } else {
        const data = await response.json();
        toast.error(data.error || "Error al desvincular WhatsApp");
      }
    } catch (error) {
      console.error("WhatsApp removal error:", error);
      toast.error("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.subscription !== "PRO") {
    return null;
  }

  if (isFetching) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700 mb-6">
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-300 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-green-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-green-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700 mb-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515"/>
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
            🚀 ¡Accede al Agente por WhatsApp!
          </h3>
          <p className="text-green-700 dark:text-green-300 text-sm mb-4">
            Como usuario Premium, puedes chatear con nuestro agente AI directamente desde WhatsApp. 
            Ingresa tu número y recibe acceso instantáneo a todas las funcionalidades del chatbot.
          </p>

          {currentWhatsApp ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-300 dark:border-green-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">WhatsApp Conectado</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{currentWhatsApp}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeWhatsApp}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    {isLoading ? "..." : "Desvincular"}
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">¿Cómo usar?</h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Envía cualquier mensaje a tu número de WhatsApp y nuestro agente responderá automáticamente. 
                  ¡Es como tener el chatbot en tu bolsillo!
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                  Número de WhatsApp (incluye código de país)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">+</span>
                  </div>
                  <input
                    type="tel"
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="1234567890"
                    className="block w-full pl-8 pr-3 py-3 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  Ejemplo: 521234567890 (México), 11987654321 (Brasil), 34612345678 (España)
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !whatsapp.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Configurando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Conectar WhatsApp</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}