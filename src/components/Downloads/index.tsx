"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import DownloadsGrid from "./DownloadsGrid";
import AdminUpload from "./AdminUpload";

export default function Downloads() {
  const { data: session } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // @ts-ignore
  const isAdmin = session?.user?.role === "ADMIN";
  // @ts-ignore
  const isPremium = session?.user?.subscription === "PREMIUM";

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!session) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            Iniciar Sesión Requerido
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Accede a tu cuenta para explorar nuestros recursos y descargas
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Recursos para usuarios registrados</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Contenido premium exclusivo</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Descargas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explora recursos y herramientas disponibles
            </p>
          </div>
        </div>
        
        {/* User Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isPremium ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {isPremium ? 'Premium' : 'Registrado'}
            </span>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-600 dark:text-red-400">
                Admin
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Upload Section */}
      {isAdmin && (
        <div className="mb-8">
          <AdminUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      {/* Downloads Grid */}
      <DownloadsGrid 
        key={refreshKey} 
        showAdminControls={isAdmin} 
      />
    </div>
  );
}