"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Verification":
        return {
          title: "🔗 Enlace no válido",
          message: "El enlace de verificación no es válido o ha expirado.",
          suggestion: "Solicita un nuevo enlace mágico desde la página de inicio de sesión."
        };
      case "AccessDenied":
        return {
          title: "🚫 Acceso denegado", 
          message: "No tienes permisos para acceder a este recurso.",
          suggestion: "Contacta al administrador si crees que esto es un error."
        };
      case "Configuration":
        return {
          title: "⚙️ Error de configuración",
          message: "Hay un problema con la configuración del servidor.",
          suggestion: "Inténtalo más tarde o contacta al soporte técnico."
        };
      default:
        return {
          title: "❌ Error de autenticación",
          message: "Ha ocurrido un error durante el proceso de autenticación.",
          suggestion: "Inténtalo nuevamente desde la página de inicio de sesión."
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-20">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="wow fadeInUp relative mx-auto max-w-[525px] overflow-hidden rounded-lg bg-white px-8 py-14 text-center dark:bg-dark-2 sm:px-12 md:px-[60px]">
              
              {/* Error Icon */}
              <div className="mb-8">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.182 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>

              <h1 className="mb-4 text-3xl font-bold text-dark dark:text-white">
                {errorInfo.title}
              </h1>
              
              <p className="mb-6 text-base text-body-color dark:text-dark-6">
                {errorInfo.message}
              </p>

              <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-dark-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 Solución:</strong><br/>
                  {errorInfo.suggestion}
                </p>
              </div>

              {error === "Verification" && (
                <div className="mb-6 rounded-lg bg-yellow-50 p-4 dark:bg-dark-3">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>🔄 ¿Necesitas un nuevo enlace?</strong><br/>
                    Los enlaces mágicos expiran después de 24 horas por seguridad.
                  </p>
                </div>
              )}

              <div className="mb-8 space-y-4">
                <Link
                  href="/signin"
                  className="block rounded-md border border-primary bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-blue-dark"
                >
                  🔑 Solicitar nuevo enlace
                </Link>
                
                <Link
                  href="/"
                  className="block rounded-md border border-stroke bg-transparent px-6 py-3 text-base font-medium text-body-color transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-dark-6"
                >
                  🏠 Ir a inicio
                </Link>
              </div>

              {error && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Error code: {error}
                </p>
              )}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}