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
      <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Requerido
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Inicia sesión para acceder a nuestra biblioteca de recursos y descargas exclusivas
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Contenido público disponible</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Recursos exclusivos para miembros</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Contenido premium especializado</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Centro de Descargas
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            Accede a recursos exclusivos, plantillas y herramientas para potenciar tu trabajo
          </p>
          
          {/* User Status */}
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full ${
                isPremium ? 'bg-purple-500' : 'bg-blue-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isPremium ? 'Usuario Premium' : 'Usuario Registrado'}
              </span>
            </div>
            {isAdmin && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-900 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  Administrador
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Admin Upload Section */}
        {isAdmin && (
          <div className="mb-8 flex justify-center">
            <AdminUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Access Level Info */}
        <div className="mb-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Niveles de Acceso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Público</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Disponible para todos los visitantes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Registrados</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Solo para usuarios registrados</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Premium</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contenido exclusivo premium</p>
            </div>
          </div>
        </div>

        {/* Downloads Grid */}
        <DownloadsGrid 
          key={refreshKey} 
          showAdminControls={isAdmin} 
        />
      </div>
    </div>
  );
}