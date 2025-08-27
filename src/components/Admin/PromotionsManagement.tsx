"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  createdAt: string;
}

const DEFAULT_PROMOTION_IDS = ["WELCOME20", "SAVE30", "FIRST50"];

export default function PromotionsManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as const,
    discountValue: "" as string | number,
    usageLimit: "",
    expiresAt: "",
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const response = await fetch("/api/admin/promotions");
      if (response.ok) {
        const data = await response.json();
        setPromotions(data.promotions || []);
      }
    } catch (error) {
      console.error("Error loading promotions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          discountValue: typeof formData.discountValue === 'string' ? parseFloat(formData.discountValue) : formData.discountValue,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        }),
      });

      if (response.ok) {
        toast.success("Promoción creada exitosamente");
        setShowCreateForm(false);
        setFormData({
          code: "",
          description: "",
          discountType: "PERCENTAGE",
          discountValue: "",
          usageLimit: "",
          expiresAt: "",
        });
        loadPromotions();
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al crear promoción");
      }
    } catch (error) {
      console.error("Error creating promotion:", error);
      toast.error("Error al crear promoción");
    }
  };

  const togglePromotion = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/promotions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        toast.success(isActive ? "Promoción desactivada" : "Promoción activada");
        loadPromotions();
      } else {
        toast.error("Error al actualizar promoción");
      }
    } catch (error) {
      console.error("Error toggling promotion:", error);
      toast.error("Error al actualizar promoción");
    }
  };

  const deletePromotion = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta promoción?")) return;

    try {
      const response = await fetch(`/api/admin/promotions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Promoción eliminada");
        loadPromotions();
      } else {
        toast.error("Error al eliminar promoción");
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Error al eliminar promoción");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Gestión de Promociones
        </h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-[#00d4ff] hover:bg-[#0099cc] text-white px-4 py-2 rounded-md text-sm transition-colors"
        >
          {showCreateForm ? "Cancelar" : "+ Nueva Promoción"}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Crear Nueva Promoción
          </h4>
          <form onSubmit={handleCreatePromotion} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código de Promoción
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                  placeholder="DESCUENTO20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Descuento
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value as any})}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                >
                  <option value="PERCENTAGE">Porcentaje (%)</option>
                  <option value="FIXED_AMOUNT">Cantidad Fija ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor del Descuento
                </label>
                <input
                  type="number"
                  value={formData.discountValue || ""}
                  onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                  min="0"
                  step={formData.discountType === "PERCENTAGE" ? "1" : "0.01"}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Límite de Uso (opcional)
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                  min="1"
                  placeholder="Ilimitado"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Expiración (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                  rows={3}
                  placeholder="Descripción de la promoción..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-[#00d4ff] hover:bg-[#0099cc] text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                Crear Promoción
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promotions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Promociones Activas
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Uso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {promotions.map((promotion) => (
                <tr key={promotion.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {promotion.code}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {promotion.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {promotion.discountType === "PERCENTAGE" 
                        ? `${promotion.discountValue}%`
                        : `$${promotion.discountValue}`
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {promotion.usedCount} / {promotion.usageLimit || "∞"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      promotion.isActive 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {promotion.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {DEFAULT_PROMOTION_IDS.includes(promotion.id) ? (
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          Promoción por defecto
                        </span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => togglePromotion(promotion.id, promotion.isActive)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            promotion.isActive
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {promotion.isActive ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          onClick={() => deletePromotion(promotion.id)}
                          className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {promotions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                No hay promociones creadas
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}