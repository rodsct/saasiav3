"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Download {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  accessLevel: "PUBLIC" | "REGISTERED" | "PREMIUM";
  category?: string;
  tags: string[];
  downloadCount: number;
  createdAt: string;
  user: {
    name?: string;
  };
}

interface DownloadsGridProps {
  showAdminControls?: boolean;
}

export default function DownloadsGrid({ showAdminControls = false }: DownloadsGridProps) {
  const { data: session } = useSession();
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PUBLIC" | "REGISTERED" | "PREMIUM">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = ["Documentos", "Plantillas", "Guías", "Software", "Recursos", "Manuales", "Otros"];

  const loadDownloads = async () => {
    try {
      const endpoint = showAdminControls ? "/api/admin/downloads" : "/api/downloads";
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        setDownloads(data.downloads);
      } else {
        toast.error("Error cargando descargas");
      }
    } catch (error) {
      console.error("Error loading downloads:", error);
      toast.error("Error cargando descargas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDownloads();
  }, [showAdminControls]);

  const handleDownload = async (downloadId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/downloads/${downloadId}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error("Necesitas una suscripción premium para descargar este archivo");
          return;
        }
        throw new Error("Error al descargar");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Descarga iniciada");
      loadDownloads(); // Refresh to update download count
    } catch (error) {
      toast.error("Error al descargar archivo");
      console.error("Download error:", error);
    }
  };

  const handleDelete = async (downloadId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este archivo?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/downloads/${downloadId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Archivo eliminado");
        loadDownloads();
      } else {
        toast.error("Error al eliminar archivo");
      }
    } catch (error) {
      toast.error("Error al eliminar archivo");
      console.error("Delete error:", error);
    }
  };

  const getAccessLevelBadge = (level: string) => {
    const styles = {
      PUBLIC: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      REGISTERED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", 
      PREMIUM: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    };

    const labels = {
      PUBLIC: "Público",
      REGISTERED: "Registrados",
      PREMIUM: "Premium"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[level as keyof typeof styles]}`}>
        {labels[level as keyof typeof labels]}
      </span>
    );
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return (
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7,2A2,2 0 0,0 5,4V20A2,2 0 0,0 7,22H17A2,2 0 0,0 19,20V8L13,2H7Z" />
          </svg>
        </div>
      );
    }
    if (mimeType.includes('image')) {
      return (
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
          </svg>
        </div>
      );
    }
    if (mimeType.includes('zip') || mimeType.includes('rar')) {
      return (
        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5,3C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L15,3H5Z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z" />
        </svg>
      </div>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUserAccess = (accessLevel: string) => {
    if (accessLevel === "PUBLIC") return true;
    if (!session) return false;
    if (accessLevel === "REGISTERED") return true;
    if (accessLevel === "PREMIUM") {
      // @ts-ignore
      return session.user?.subscription === "PREMIUM";
    }
    return false;
  };

  const filteredDownloads = downloads.filter(download => {
    const matchesFilter = filter === "ALL" || download.accessLevel === filter;
    const matchesSearch = !searchTerm || 
      download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || download.category === selectedCategory;
    
    return matchesFilter && matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Access Level Filter */}
          {showAdminControls && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Todos los niveles</option>
              <option value="PUBLIC">Público</option>
              <option value="REGISTERED">Registrados</option>
              <option value="PREMIUM">Premium</option>
            </select>
          )}
        </div>
      </div>

      {/* Downloads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDownloads.map((download) => {
          const canAccess = canUserAccess(download.accessLevel);
          
          return (
            <div
              key={download.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border transition-all duration-200 hover:shadow-xl ${
                canAccess ? 'hover:border-blue-500 dark:hover:border-blue-400' : 'opacity-75'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {getFileIcon(download.mimeType)}
                  <div className="flex items-center space-x-2">
                    {getAccessLevelBadge(download.accessLevel)}
                    {!canAccess && (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {download.title}
                </h3>
                
                {download.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {download.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>{formatFileSize(download.fileSize)}</span>
                  <span>{download.downloadCount} descargas</span>
                </div>

                {download.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {download.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {download.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                        +{download.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleDownload(download.id, download.fileName)}
                    disabled={!canAccess}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      canAccess
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>
                      {canAccess ? 'Descargar' : download.accessLevel === 'PREMIUM' ? 'Premium' : 'Registrarse'}
                    </span>
                  </button>

                  {showAdminControls && (
                    <button
                      onClick={() => handleDelete(download.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDownloads.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No se encontraron archivos
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? "Intenta con otros términos de búsqueda" : "Aún no hay archivos disponibles"}
          </p>
        </div>
      )}
    </div>
  );
}