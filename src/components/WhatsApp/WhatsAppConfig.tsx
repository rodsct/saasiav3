"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import QRCodeGenerator from "./QRCodeGenerator";

interface WhatsAppConfigProps {
  onWhatsAppSaved?: (phoneNumber: string) => void;
}

export default function WhatsAppConfig({ onWhatsAppSaved }: WhatsAppConfigProps) {
  const { user, updateUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(user?.whatsapp || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setMessage("Por favor ingresa tu número de WhatsApp");
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ""))) {
      setMessage("Por favor ingresa un número de WhatsApp válido (ej: +52 55 1234 5678)");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/user/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          whatsapp: phoneNumber.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("¡Número de WhatsApp guardado exitosamente! Ahora podrás usar Aranza desde WhatsApp.");
        
        // Update user context
        if (updateUser) {
          updateUser({ ...user, whatsapp: phoneNumber.trim() });
        }

        // Call callback if provided
        if (onWhatsAppSaved) {
          onWhatsAppSaved(phoneNumber.trim());
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Error al guardar el número de WhatsApp");
      }
    } catch (error) {
      console.error("Error saving WhatsApp:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-black dark:text-white">
          📱 Configurar WhatsApp Premium
        </h3>
        <p className="mt-2 text-sm text-body-color">
          Conecta tu número de WhatsApp para acceder a Aranza desde cualquier lugar.
          Con tu suscripción PRO, podrás usar todas las funcionalidades premium directamente desde WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="whatsapp" 
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            Número de WhatsApp *
          </label>
          <input
            type="tel"
            id="whatsapp"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+52 55 1234 5678"
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-body-color">
            Incluye el código de país (ej: +52 para México, +1 para USA)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded-full bg-green-500"></div>
          <span className="text-sm text-body-color">
            Suscripción PRO activa
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
        >
          {isLoading ? "Guardando..." : "Conectar WhatsApp"}
        </button>

        {message && (
          <div className={`rounded-lg p-3 text-sm ${
            message.includes("exitosamente") 
              ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200" 
              : "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}>
            {message}
          </div>
        )}
      </form>

      {user?.whatsapp && (
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              ¡WhatsApp Configurado!
            </h4>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              Tu número: {user.whatsapp}
            </p>
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              Ahora puedes chatear con Aranza desde WhatsApp usando el enlace de abajo.
            </p>
          </div>
          
          <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
              🔗 Acceso Directo a WhatsApp
            </h4>
            <QRCodeGenerator phoneNumber={user.whatsapp} />
          </div>
        </div>
      )}
    </div>
  );
}