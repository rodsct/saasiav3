"use client";

import { useState, useEffect } from "react";

export default function WhatsAppContactBanner() {
  const [qrData, setQrData] = useState<{
    whatsappUrl: string;
    whatsappNumber: string;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed
    const dismissed = localStorage.getItem('whatsapp-contact-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
    
    fetchQRData();
  }, []);

  const fetchQRData = async () => {
    try {
      const response = await fetch("/api/whatsapp-qr");
      
      if (response.ok) {
        const data = await response.json();
        setQrData(data);
      } else {
        setQrData(null);
      }
    } catch (error) {
      console.error("Error fetching QR data:", error);
      setQrData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('whatsapp-contact-dismissed', 'true');
  };

  // Don't render if loading, not configured, or dismissed
  if (isLoading || !qrData || isDismissed) {
    return null;
  }

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData.whatsappUrl)}`;

  return (
    <>
      {/* Mobile Banner */}
      <div className="lg:hidden bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-lg p-3 m-4 mb-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white">
                💬 ¿Necesitas ayuda?
              </h3>
              <p className="text-xs text-gray-300">
                Escanea el QR para chatear por WhatsApp
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              Ver QR
            </button>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a]/95 border border-[#00d4ff]/20 rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Contáctanos por WhatsApp</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center space-y-4">
              <img 
                src={qrApiUrl} 
                alt="WhatsApp QR Code" 
                className="w-40 h-40 mx-auto border border-gray-600 rounded-lg bg-white"
              />
              
              <div>
                <p className="text-sm text-green-300 mb-1">
                  📱 Escanea para chatear
                </p>
                <p className="text-xs text-gray-400 font-mono">
                  {qrData.whatsappNumber}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    window.open(qrData.whatsappUrl, '_blank');
                    setShowModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                  <span>Abrir WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}