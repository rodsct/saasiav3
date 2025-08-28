"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface EmailTemplate {
  id: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  isActive: boolean;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export default function EmailTemplatesManagement() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/admin/email-templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        toast.error("Error al cargar plantillas");
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (template: EmailTemplate) => {
    try {
      const response = await fetch(`/api/admin/email-templates/${template.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: template.subject,
          htmlContent: template.htmlContent,
          textContent: template.textContent,
          isActive: template.isActive,
        }),
      });

      if (response.ok) {
        toast.success("Plantilla guardada exitosamente");
        setShowEditor(false);
        setSelectedTemplate(null);
        loadTemplates();
      } else {
        toast.error("Error al guardar plantilla");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Error de conexión");
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Ingresa un email para la prueba");
      return;
    }

    setIsSendingTest(true);
    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: testEmail }),
      });

      if (response.ok) {
        toast.success("Email de prueba enviado exitosamente");
        setTestEmail("");
      } else {
        const data = await response.json();
        toast.error(data.error || "Error al enviar email de prueba");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Error de conexión");
    } finally {
      setIsSendingTest(false);
    }
  };

  const initializeTemplates = async () => {
    try {
      const response = await fetch("/api/admin/email-templates/initialize", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Plantillas inicializadas exitosamente");
        loadTemplates();
      } else {
        toast.error("Error al inicializar plantillas");
      }
    } catch (error) {
      console.error("Error initializing templates:", error);
      toast.error("Error de conexión");
    }
  };

  const getTemplateDisplayName = (type: string): string => {
    const names: { [key: string]: string } = {
      WELCOME_REGISTRATION: "Bienvenida - Registro",
      EMAIL_VERIFICATION: "Verificación de Email",
      PASSWORD_RESET: "Reseteo de Contraseña",
      SUBSCRIPTION_ACTIVATED: "Suscripción Activada",
      SUBSCRIPTION_CANCELLED: "Suscripción Cancelada",
      SUBSCRIPTION_RENEWED: "Suscripción Renovada",
      SUBSCRIPTION_FAILED: "Pago Fallido",
      SUBSCRIPTION_EXPIRING: "Suscripción por Expirar",
      PAYMENT_SUCCESS: "Pago Exitoso",
      PAYMENT_FAILED: "Pago Fallido",
      TRIAL_STARTED: "Trial Iniciado",
      TRIAL_ENDING: "Trial Terminando",
      ACCOUNT_SUSPENDED: "Cuenta Suspendida",
      ACCOUNT_REACTIVATED: "Cuenta Reactivada",
    };
    return names[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d4ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestión de Plantillas de Email
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Personaliza los emails automáticos del sistema
          </p>
        </div>
        {templates.length === 0 && (
          <button
            onClick={initializeTemplates}
            className="bg-[#00d4ff] hover:bg-[#0099cc] text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Inicializar Plantillas
          </button>
        )}
      </div>

      {/* Test Email Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          🧪 Probar Configuración de Email
        </h4>
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
          />
          <button
            onClick={sendTestEmail}
            disabled={isSendingTest}
            className="bg-[#00d4ff] hover:bg-[#0099cc] disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            {isSendingTest ? "Enviando..." : "Enviar Prueba"}
          </button>
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Plantillas de Email ({templates.length})
          </h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plantilla
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Asunto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Variables
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {templates.map((template) => (
                <tr key={template.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {getTemplateDisplayName(template.type)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {template.type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {template.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      template.isActive 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {template.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {template.variables.slice(0, 3).map((variable) => (
                        <span key={variable} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          {variable}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          +{template.variables.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowEditor(true);
                      }}
                      className="text-[#00d4ff] hover:text-[#0099cc] font-medium"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {templates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                No hay plantillas configuradas
              </div>
              <button
                onClick={initializeTemplates}
                className="bg-[#00d4ff] hover:bg-[#0099cc] text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                Crear Plantillas por Defecto
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Editar: {getTemplateDisplayName(selectedTemplate.type)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Variables disponibles: {selectedTemplate.variables.join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEditor(false);
                    setSelectedTemplate(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asunto
                </label>
                <input
                  type="text"
                  value={selectedTemplate.subject}
                  onChange={(e) => setSelectedTemplate({
                    ...selectedTemplate,
                    subject: e.target.value
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                />
              </div>

              {/* HTML Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenido HTML
                </label>
                <textarea
                  value={selectedTemplate.htmlContent}
                  onChange={(e) => setSelectedTemplate({
                    ...selectedTemplate,
                    htmlContent: e.target.value
                  })}
                  rows={20}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] font-mono text-sm"
                />
              </div>

              {/* Text Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenido de Texto (opcional)
                </label>
                <textarea
                  value={selectedTemplate.textContent || ""}
                  onChange={(e) => setSelectedTemplate({
                    ...selectedTemplate,
                    textContent: e.target.value
                  })}
                  rows={10}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] font-mono text-sm"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTemplate.isActive}
                  onChange={(e) => setSelectedTemplate({
                    ...selectedTemplate,
                    isActive: e.target.checked
                  })}
                  className="h-4 w-4 text-[#00d4ff] focus:ring-[#00d4ff] border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Plantilla activa
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditor(false);
                    setSelectedTemplate(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => saveTemplate(selectedTemplate)}
                  className="bg-[#00d4ff] hover:bg-[#0099cc] text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  Guardar Plantilla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}