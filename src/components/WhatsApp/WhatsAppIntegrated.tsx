"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function WhatsAppIntegrated() {
  const { user, updateUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(user?.whatsapp || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [savedWhatsApp, setSavedWhatsApp] = useState(user?.whatsapp || "");
  const [adminWhatsApp, setAdminWhatsApp] = useState("");

  useEffect(() => {
    // Solo mostrar config si realmente no hay WhatsApp guardado
    const hasWhatsApp = user?.whatsapp && user.whatsapp.trim() !== "";
    setPhoneNumber(user?.whatsapp || "");
    setSavedWhatsApp(user?.whatsapp || "");
    setShowConfig(!hasWhatsApp);
    fetchAdminWhatsApp();
  }, [user?.whatsapp]);

  const fetchAdminWhatsApp = async () => {
    try {
      const response = await fetch("/api/whatsapp-qr");
      if (response.ok) {
        const data = await response.json();
        setAdminWhatsApp(data.whatsappNumber || "");
      }
    } catch (error) {
      console.error("Error fetching admin WhatsApp:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setMessage("Por favor ingresa tu número de WhatsApp");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ""))) {
      setMessage("Por favor ingresa un número válido (ej: +52 55 1234 5678)");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Try the new simple endpoint with user email
      let response = await fetch("/api/user/whatsapp-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          whatsapp: phoneNumber.trim(),
          userEmail: user?.email,
        }),
      });

      // If simple endpoint fails, try debug
      if (!response.ok) {
        console.log("Simple endpoint failed, trying debug...");
        response = await fetch("/api/debug/whatsapp-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            whatsapp: phoneNumber.trim(),
          }),
        });
      }

      // If debug also fails, try original
      if (!response.ok) {
        console.log("Debug endpoint failed, trying original...");
        response = await fetch("/api/user/whatsapp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            whatsapp: phoneNumber.trim(),
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        console.log("WhatsApp save response:", data);
        setMessage(`¡Suscripción premium activada para ${phoneNumber.trim()}!`);
        setSavedWhatsApp(phoneNumber.trim());
        setShowConfig(false); // Ocultar formulario después de guardar
        
        // Update user context
        if (updateUser) {
          updateUser({ ...user, whatsapp: phoneNumber.trim() });
        }
        
        // Limpiar mensaje después de unos segundos
        setTimeout(() => {
          setMessage("");
        }, 5000);
      } else {
        const errorData = await response.json();
        console.error("WhatsApp save error:", errorData);
        setMessage(errorData.error || errorData.debug?.errorMessage || "Error al guardar el número");
      }
    } catch (error) {
      console.error("Error saving WhatsApp:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const generateWhatsAppUrl = () => {
    if (!adminWhatsApp) return "";
    const message = `Hola Aranza, soy ${user?.name || 'un usuario'} premium con número ${savedWhatsApp}. Quiero usar mis funciones de WhatsApp.`;
    return `https://wa.me/${adminWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  const qrApiUrl = savedWhatsApp && adminWhatsApp
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateWhatsAppUrl())}`
    : "";

  const handleEditWhatsApp = () => {
    setShowConfig(true);
    setMessage("");
    // Mantener el número actual en el campo para editar
    setPhoneNumber(savedWhatsApp);
  };


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
              <h3 className="text-xs font-medium text-white">
                {savedWhatsApp ? "WhatsApp Premium" : "Configurar WhatsApp"}
              </h3>
              <span className="text-xs text-green-400">
                {savedWhatsApp ? "¡Listo para usar!" : "PRO requerido"}
              </span>
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
          <div className="space-y-3 bg-[#1a1a2e]/30 rounded-lg p-4">
            {showConfig ? (
              // Configuration Form
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">
                  📱 Activa Premium para WhatsApp
                </h4>
                <p className="text-xs text-gray-400">
                  Registra tu número para recibir servicio premium de Aranza por WhatsApp
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+52 55 1234 5678"
                      className="w-full bg-[#0a0a0a]/50 border border-[#00d4ff]/30 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4ff]"
                      disabled={isLoading}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Incluye código de país
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "Activando..." : savedWhatsApp ? "Actualizar Número" : "Activar Premium WhatsApp"}
                    </button>
                    
                    {savedWhatsApp && (
                      <button
                        type="button"
                        onClick={() => setShowConfig(false)}
                        className="w-full bg-gray-600/80 hover:bg-gray-600 text-white text-xs py-2 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>

                {message && (
                  <div className={`text-xs p-2 rounded ${
                    message.includes("exitosamente") 
                      ? "bg-green-900/30 text-green-300 border border-green-700/50" 
                      : "bg-red-900/30 text-red-300 border border-red-700/50"
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            ) : (
              // QR and Actions
              <div className="space-y-3">
                <div className="text-center">
                  <div className="mb-3">
                    <img 
                      src={qrApiUrl} 
                      alt="WhatsApp QR Code" 
                      className="w-24 h-24 mx-auto border border-gray-600 rounded-lg bg-white"
                    />
                  </div>
                  
                  <p className="text-xs text-green-300 mb-2">
                    📱 Escanea para chatear con Aranza
                  </p>
                  
                  <p className="text-xs text-gray-400 mb-1">
                    Agente: {adminWhatsApp}
                  </p>
                  <p className="text-xs text-green-400 mb-3">
                    Tu número registrado: {savedWhatsApp}
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => window.open(generateWhatsAppUrl(), '_blank')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                      </svg>
                      <span>Abrir WhatsApp</span>
                    </button>
                    
                    <button
                      onClick={handleEditWhatsApp}
                      className="w-full bg-blue-600/80 hover:bg-blue-600 text-white text-xs py-2 rounded-lg transition-colors"
                    >
                      Cambiar número
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}