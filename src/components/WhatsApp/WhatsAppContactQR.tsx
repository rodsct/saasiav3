"use client";

import { useState, useEffect } from "react";

export default function WhatsAppContactQR() {
  const [qrData, setQrData] = useState<{
    whatsappUrl: string;
    whatsappNumber: string;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchQRData();
  }, []);

  const fetchQRData = async () => {
    try {
      const response = await fetch("/api/whatsapp-qr");
      
      if (response.ok) {
        const data = await response.json();
        setQrData(data);
      } else {
        // WhatsApp not configured
        setQrData(null);
      }
    } catch (error) {
      console.error("Error fetching QR data:", error);
      setQrData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if not configured
  if (isLoading || !qrData) {
    return null;
  }

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData.whatsappUrl)}`;

  return (
    <div className="border-t border-[#00d4ff]/20 p-3 lg:p-4">
      <div className="space-y-3">
        {/* WhatsApp Header */}
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-[#1a1a2e]/30 rounded-lg p-2 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-medium text-white">¡Contáctanos!</h3>
              <span className="text-xs text-green-400">WhatsApp disponible</span>
            </div>
          </div>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* WhatsApp QR Content */}
        {isExpanded && (
          <div className="space-y-3 bg-[#1a1a2e]/30 rounded-lg p-4">
            <div className="text-center">
              <div className="mb-3">
                <img 
                  src={qrApiUrl} 
                  alt="WhatsApp QR Code" 
                  className="w-32 h-32 mx-auto border border-gray-600 rounded-lg bg-white"
                />
              </div>
              
              <p className="text-xs text-green-300 mb-2">
                📱 Escanea para chatear por WhatsApp
              </p>
              
              <p className="text-xs text-gray-400 mb-3">
                {qrData.whatsappNumber}
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => window.open(qrData.whatsappUrl, '_blank')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                  <span>Abrir WhatsApp</span>
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(qrData.whatsappUrl);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg transition-colors"
                >
                  Copiar enlace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}