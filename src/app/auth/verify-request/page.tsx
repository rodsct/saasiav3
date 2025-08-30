"use client";

import Link from "next/link";

export default function VerifyRequest() {
  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-20">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="wow fadeInUp relative mx-auto max-w-[525px] overflow-hidden rounded-lg bg-white px-8 py-14 text-center dark:bg-dark-2 sm:px-12 md:px-[60px]">
              
              {/* Success Icon */}
              <div className="mb-8">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M12 12v7" />
                  </svg>
                </div>
              </div>

              <h1 className="mb-4 text-3xl font-bold text-dark dark:text-white">
                📧 ¡Enlace enviado!
              </h1>
              
              <p className="mb-6 text-base text-body-color dark:text-dark-6">
                Te hemos enviado un <strong>enlace mágico</strong> a tu dirección de correo electrónico.
              </p>

              <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-dark-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>📱 Revisa tu bandeja de entrada</strong><br/>
                  Haz clic en el enlace del email para acceder automáticamente a tu cuenta.
                </p>
              </div>

              <div className="mb-6 rounded-lg bg-yellow-50 p-4 dark:bg-dark-3">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ Importante:</strong> El enlace expirará en 24 horas. Si no encuentras el email, revisa tu carpeta de spam.
                </p>
              </div>

              <div className="mb-8">
                <Link
                  href="/signin"
                  className="inline-block rounded-md border border-primary bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-blue-dark"
                >
                  ← Volver al Login
                </Link>
              </div>

              <p className="text-sm text-body-color dark:text-dark-6">
                ¿Problemas con el email?{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contáctanos
                </Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}