"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState("");

  const plan = searchParams.get("plan");
  const price = searchParams.get("price");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // If we have a session_id, the payment was processed by Stripe
    // Refresh user data to get updated subscription
    if (sessionId && user?.id) {
      refreshUser();
    } else if (user?.id) {
      // Fallback: refresh user data 
      refreshUser();
    }
  }, [sessionId, user, refreshUser]);


  if (isActivating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-lg w-full mx-auto p-8 text-center">
          <div className="animate-spin w-16 h-16 mx-auto mb-6 border-4 border-green-200 border-t-green-500 rounded-full"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Activando tu suscripción PRO...
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Por favor espera mientras procesamos tu suscripción.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-lg w-full mx-auto p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error de Activación
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error}
          </p>
          <button 
            onClick={() => router.push("/")}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          ¡Bienvenido a PRO! 🎉
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
          Tu suscripción PRO ha sido activada exitosamente. Ahora tienes acceso completo a Aranza AI y todas las funciones premium.
        </p>

        {/* Plan Details */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Plan Activado:
          </h3>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {plan?.toUpperCase()} - ${price}/mes
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button 
            onClick={() => router.push("/chatbot")}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Ir a Aranza AI
          </button>
          
          <button 
            onClick={() => router.push("/downloads")}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Ver Descargas PRO
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Suscripción activada para: <span className="font-medium">{user.email}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full"></div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}