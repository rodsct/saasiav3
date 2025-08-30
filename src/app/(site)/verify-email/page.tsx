"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams?.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token de verificación faltante. Por favor usa el enlace del email de verificación.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/verify-email?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          toast.success('✅ Email verificado correctamente');
          
          // Auto-redirect to login after 3 seconds
          setTimeout(() => {
            window.location.href = '/signin?message=email-verified';
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Error verifying email');
          toast.error('❌ Error al verificar email');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error connecting to server');
        toast.error('❌ Error de conexión');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Verificación de Email
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d4ff] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Verificando email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-green-600 dark:text-green-300 font-medium">{message}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Serás redirigido al login en unos segundos...
              </p>
              <div className="mt-4">
                <a
                  href="/signin"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#00d4ff] hover:bg-[#00b8e6] transition-colors"
                >
                  Iniciar Sesión Ahora
                </a>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="text-red-600 dark:text-red-300 font-medium">{message}</p>
              <div className="mt-4">
                <a
                  href="/signin"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                >
                  Volver al Inicio
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}