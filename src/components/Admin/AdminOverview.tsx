"use client";

import { useState, useEffect } from "react";

interface AdminStats {
  totalUsers: number;
  proUsers: number;
  totalDownloads: number;
  totalRevenue: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    subscription: string;
  }>;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    proUsers: 0,
    totalDownloads: 0,
    totalRevenue: 0,
    recentUsers: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Try simplified endpoint first, fallback to original
      let response = await fetch("/api/admin/stats-simple");
      
      if (!response.ok || response.status === 404) {
        console.log("Simplified stats endpoint not available, using fallback");
        response = await fetch("/api/admin/stats");
      }
      
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error("Stats response is not JSON:", contentType);
        }
      }
    } catch (error) {
      console.error("Error loading admin stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d4ff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-lg p-3 sm:p-4 lg:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-[#00d4ff]/70 text-xs sm:text-sm">Total Usuarios</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="text-[#00d4ff]/70 text-lg sm:text-xl hidden sm:block">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 sm:p-4 lg:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-green-200 text-xs sm:text-sm">Usuarios PRO</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.proUsers}</p>
            </div>
            <div className="text-green-200 text-lg sm:text-xl hidden sm:block">⭐</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 sm:p-4 lg:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-purple-200 text-xs sm:text-sm">Total Descargas</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.totalDownloads}</p>
            </div>
            <div className="text-purple-200 text-lg sm:text-xl hidden sm:block">📁</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-3 sm:p-4 lg:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-orange-200 text-xs sm:text-sm">Ingresos Total</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="text-orange-200 text-lg sm:text-xl hidden sm:block">💰</div>
          </div>
        </div>
      </div>

      {/* WhatsApp Integration for Premium Users */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Integración WhatsApp
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configuración de acceso al agente vía WhatsApp para usuarios Premium
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-700">
            <h4 className="text-sm sm:text-md font-medium text-green-800 dark:text-green-200 mb-2">
              📱 ¿Cómo funciona?
            </h4>
            <div className="text-xs sm:text-sm text-green-700 dark:text-green-300 space-y-1">
              <p>• Los usuarios <strong>Premium</strong> pueden acceder al agente AI vía WhatsApp</p>
              <p>• Al ingresar su número, se conecta automáticamente con nuestro sistema n8n</p>
              <p>• El agente responderá directamente a través de WhatsApp</p>
              <p>• Funcionalidad exclusiva para suscripciones PRO</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
            <h4 className="text-sm sm:text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
              📊 Estadísticas de WhatsApp
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.recentUsers.filter(user => user.subscription === 'PRO').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Usuarios Premium</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00d4ff] dark:text-[#00d4ff]">
                  0
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">WhatsApp Configurados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}