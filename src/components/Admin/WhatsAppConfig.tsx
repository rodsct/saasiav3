"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface WhatsAppConfig {
  whatsappNumber?: string;
  whatsappMessage?: string;
  isWhatsappEnabled: boolean;
}

export default function WhatsAppConfig() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    whatsappNumber: "",
    whatsappMessage: "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.",
    isWhatsappEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [migrationNeeded, setMigrationNeeded] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (config.whatsappNumber && config.isWhatsappEnabled) {
      generateQRUrl();
    } else {
      setQrUrl("");
    }
  }, [config.whatsappNumber, config.whatsappMessage, config.isWhatsappEnabled]);

  const fetchConfig = async () => {
    try {
      setIsFetching(true);
      const response = await fetch("/api/admin/whatsapp-config");
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config || {
          whatsappNumber: "",
          whatsappMessage: "¡Hola! Me gustaría obtener más información sobre sus servicios de IA y automatizaciones.",
          isWhatsappEnabled: false,
        });
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Error al cargar configuración");
    } finally {
      setIsFetching(false);
    }
  };

  const generateQRUrl = () => {
    if (!config.whatsappNumber) return;
    
    const cleanNumber = config.whatsappNumber.replace(/[+\s-()]/g, '');
    const message = encodeURIComponent(config.whatsappMessage || "Hola");
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    
    // Generate QR using qr-server API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappUrl)}`;
    setQrUrl(qrApiUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/whatsapp-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (response.ok) {
        setConfig(data.config);
        setMigrationNeeded(false);
        
        if (data.message) {
          toast.success("Configuración actualizada temporalmente");
        } else {
          toast.success("Configuración de WhatsApp actualizada");
        }
      } else {
        if (data.requiresMigration) {
          setMigrationNeeded(true);
          toast.error("Se necesita ejecutar migración de base de datos");
        } else {
          toast.error(data.error || "Error al actualizar configuración");
        }
      }
    } catch (error) {
      console.error("Error updating config:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const copyQRUrl = () => {
    if (qrUrl) {
      navigator.clipboard.writeText(qrUrl);
      toast.success("URL del QR copiada");
    }
  };

  const downloadQR = () => {
    if (qrUrl) {
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = 'whatsapp-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuración de WhatsApp
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configura el número de WhatsApp para que los usuarios puedan contactarte
          </p>
        </div>
      </div>

      {/* Migration Notice */}
      {migrationNeeded && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
            ⚠️ Migración de Base de Datos Requerida
          </h4>
          <p className="text-sm text-red-800 dark:text-red-300 mb-3">
            Para usar la configuración de WhatsApp, es necesario ejecutar las migraciones de la base de datos.
          </p>
          <div className="bg-red-100 dark:bg-red-800/30 rounded p-2">
            <code className="text-xs text-red-900 dark:text-red-200">
              npx prisma migrate dev
            </code>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Form */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configuración
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Habilitar WhatsApp
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.isWhatsappEnabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, isWhatsappEnabled: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Mostrar código QR en la página del chatbot
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de WhatsApp
              </label>
              <input
                type="tel"
                value={config.whatsappNumber || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                placeholder="+521234567890"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">
                Incluye el código de país (ej: +52 para México, +1 para USA)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensaje predeterminado
              </label>
              <textarea
                value={config.whatsappMessage || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, whatsappMessage: e.target.value }))}
                rows={3}
                placeholder="¡Hola! Me gustaría obtener más información..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">
                Este mensaje aparecerá preescrito cuando escaneen el QR
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? "Guardando..." : "Guardar configuración"}
            </button>
          </form>
        </div>

        {/* QR Code Preview */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Vista previa del QR
          </h3>
          
          {config.isWhatsappEnabled && config.whatsappNumber && qrUrl ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={qrUrl} 
                  alt="WhatsApp QR Code" 
                  className="w-48 h-48 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Escanea para chatear por WhatsApp
                </p>
                <p className="text-xs font-mono text-gray-500">
                  {config.whatsappNumber}
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={copyQRUrl}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded-md transition-colors"
                >
                  Copiar URL del QR
                </button>
                <button
                  onClick={downloadQR}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-md transition-colors"
                >
                  Descargar QR
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 011-1h2m0 0V4a2 2 0 012-2h1M9 7h1m-1 0v1m1-1h1m-1 1v1m-1-1v4m1-4h1m6 0h1v1m-1-1h1m-1 1v1m0-1h.01" />
              </svg>
              <p className="text-sm text-center">
                {!config.isWhatsappEnabled ? "WhatsApp está deshabilitado" : 
                 !config.whatsappNumber ? "Configura un número de WhatsApp para ver el QR" :
                 "Configurando QR..."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Temporary Storage Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
          ⚠️ Configuración Temporal
        </h4>
        <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
          Los cambios se guardan temporalmente en memoria y se perderán al reiniciar el servidor.
        </p>
        <div className="bg-yellow-100 dark:bg-yellow-800/30 rounded p-2">
          <code className="text-xs text-yellow-900 dark:text-yellow-200">
            Para persistencia: npx prisma migrate dev
          </code>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          ℹ️ Instrucciones de uso
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Configure el número de WhatsApp donde quiere recibir mensajes</li>
          <li>• El mensaje predeterminado aparecerá cuando los usuarios escaneen el QR</li>
          <li>• Una vez habilitado, el QR aparecerá en la página del chatbot</li>
          <li>• Los usuarios podrán escanear el QR para contactarle directamente</li>
        </ul>
      </div>
    </div>
  );
}