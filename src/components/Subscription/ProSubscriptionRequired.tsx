"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface ProSubscriptionRequiredProps {
  expired?: boolean;
}

export default function ProSubscriptionRequired({ expired = false }: ProSubscriptionRequiredProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {expired ? "Suscripción Expirada" : "Suscripción PRO Requerida"}
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
            {expired 
              ? "Tu suscripción PRO ha expirado. Renueva tu suscripción para continuar accediendo a Aranza AI."
              : "El acceso a Aranza AI está disponible exclusivamente para miembros PRO. Actualiza tu plan para chatear con nuestro asistente de inteligencia artificial."
            }
          </p>

          {/* Features List */}
          <div className="text-left mb-8 bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              ✨ Con tu suscripción PRO obtienes:
            </h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Acceso ilimitado a Aranza AI
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Conversaciones sin límites
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Historial de conversaciones guardado
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Acceso a descargas exclusivas PRO
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Soporte prioritario
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                $49
                <span className="text-lg font-normal text-gray-600 dark:text-gray-300">/mes</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Facturación mensual • Cancela en cualquier momento
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link 
              href="/pricing"
              className="w-full block bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {expired ? "Renovar Suscripción PRO" : "Activar Suscripción PRO"}
            </Link>
            
            <Link 
              href="/"
              className="w-full block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>

          {/* User Info */}
          {user && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Conectado como: <span className="font-medium">{user.email}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}