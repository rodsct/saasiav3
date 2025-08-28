"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface PriceData {
  id: string;
  unit_amount: number;
  nickname: string;
  offers: string[];
}

export default function PricingManagement() {
  const [pricing, setPricing] = useState<PriceData>({
    id: "price_pro_monthly_49",
    unit_amount: 4900, // $49.00 in cents
    nickname: "PRO",
    offers: [
      "Acceso ilimitado a Aranza AI",
      "Conversaciones sin límites",
      "Historial guardado permanentemente",
      "Acceso a descargas exclusivas PRO",
      "Interfaz premium sin restricciones",
      "Soporte prioritario 24/7",
      "Nuevas funciones primero",
      "Cancela en cualquier momento",
    ],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [stripeProducts, setStripeProducts] = useState([]);

  useEffect(() => {
    loadCurrentPricing();
    loadStripeProducts();
  }, []);

  const loadCurrentPricing = async () => {
    try {
      const response = await fetch("/api/current-pricing");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.pricing) {
          setPricing(prevPricing => ({
            ...prevPricing,
            id: data.pricing.id,
            unit_amount: data.pricing.unit_amount,
            nickname: data.pricing.nickname,
          }));
          console.log("Loaded current pricing from database:", data.pricing, "Source:", data.source);
        }
      }
    } catch (error) {
      console.error("Error loading current pricing:", error);
    }
  };

  const loadStripeProducts = async () => {
    try {
      const response = await fetch("/api/admin/stripe/products");
      
      if (!response.ok) {
        if (response.status === 500) {
          console.error("Server error loading Stripe products - retrying later");
          return;
        }
        console.error("Error loading Stripe products:", response.status);
        return;
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.error("Stripe products response is not JSON:", contentType, "Status:", response.status);
        return;
      }
      
      const data = await response.json();
      setStripeProducts(data.products || []);
    } catch (error) {
      console.error("Error loading Stripe products:", error);
    }
  };

  const handlePriceChange = (field: keyof PriceData, value: any) => {
    setPricing(prev => ({ ...prev, [field]: value }));
  };

  const handleOfferChange = (index: number, value: string) => {
    const newOffers = [...pricing.offers];
    newOffers[index] = value;
    setPricing(prev => ({ ...prev, offers: newOffers }));
  };

  const addOffer = () => {
    setPricing(prev => ({ ...prev, offers: [...prev.offers, ""] }));
  };

  const removeOffer = (index: number) => {
    const newOffers = pricing.offers.filter((_, i) => i !== index);
    setPricing(prev => ({ ...prev, offers: newOffers }));
  };

  const savePricing = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pricing),
      });

      if (response.ok) {
        toast.success("Precios actualizados correctamente");
      } else {
        toast.error("Error al actualizar precios");
      }
    } catch (error) {
      console.error("Error saving pricing:", error);
      toast.error("Error al guardar cambios");
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithStripe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/stripe/sync", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Sincronizado con Stripe");
        loadStripeProducts();
      } else {
        toast.error("Error al sincronizar con Stripe");
      }
    } catch (error) {
      console.error("Error syncing with Stripe:", error);
      toast.error("Error de sincronización");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Pricing */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuración de Precios PRO
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Precio (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={pricing.unit_amount / 100}
                onChange={(e) => handlePriceChange("unit_amount", parseInt(e.target.value) * 100)}
                className="pl-8 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID del Producto
            </label>
            <input
              type="text"
              value={pricing.id}
              onChange={(e) => handlePriceChange("id", e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre del Plan
          </label>
          <input
            type="text"
            value={pricing.nickname}
            onChange={(e) => handlePriceChange("nickname", e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Features/Offers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Características del Plan PRO
          </h3>
          <button
            onClick={addOffer}
            className="bg-[#00d4ff] hover:bg-[#0099cc] text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            + Agregar Característica
          </button>
        </div>

        <div className="space-y-3">
          {pricing.offers.map((offer, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={offer}
                onChange={(e) => handleOfferChange(index, e.target.value)}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                placeholder="Característica del plan..."
              />
              <button
                onClick={() => removeOffer(index)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm transition-colors"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Integration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Integración con Stripe
          </h3>
          <button
            onClick={syncWithStripe}
            disabled={isLoading}
            className="bg-[#00d4ff] hover:bg-[#0099cc] disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            {isLoading ? "Sincronizando..." : "Sincronizar con Stripe"}
          </button>
        </div>

        {stripeProducts.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Productos en Stripe:
            </h4>
            <div className="space-y-2">
              {stripeProducts.map((product: any) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-900 dark:text-white">{product.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{product.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={savePricing}
          disabled={isLoading}
          className="bg-[#00d4ff] hover:bg-[#0099cc] disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}