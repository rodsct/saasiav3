"use client";

import { useEffect, useRef, useState } from 'react';

interface HCaptchaProps {
  sitekey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  onLoad?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

declare global {
  interface Window {
    hcaptcha: {
      render: (container: string | Element, config: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      execute: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
    hCaptchaOnLoad: () => void;
  }
}

const HCaptcha: React.FC<HCaptchaProps> = ({
  sitekey,
  onVerify,
  onError,
  onExpire,
  onLoad,
  theme = 'light',
  size = 'normal',
}) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadHCaptcha = () => {
      if (window.hcaptcha && captchaRef.current) {
        const id = window.hcaptcha.render(captchaRef.current, {
          sitekey,
          theme,
          size,
          callback: onVerify,
          'error-callback': onError,
          'expired-callback': onExpire,
        });
        setWidgetId(id);
        setIsLoaded(true);
        onLoad?.();
      }
    };

    if (window.hcaptcha) {
      loadHCaptcha();
    } else {
      // Load hCaptcha script if not already loaded
      if (!document.querySelector('script[src*="hcaptcha.com/1/api.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://js.hcaptcha.com/1/api.js?onload=hCaptchaOnLoad&render=explicit';
        script.async = true;
        script.defer = true;
        
        window.hCaptchaOnLoad = loadHCaptcha;
        
        document.head.appendChild(script);
      } else {
        // Script already loaded, check if hcaptcha is available
        const checkHCaptcha = setInterval(() => {
          if (window.hcaptcha) {
            clearInterval(checkHCaptcha);
            loadHCaptcha();
          }
        }, 100);
        
        // Clear interval after 10 seconds if not loaded
        setTimeout(() => clearInterval(checkHCaptcha), 10000);
      }
    }

    return () => {
      if (widgetId && window.hcaptcha) {
        try {
          window.hcaptcha.remove(widgetId);
        } catch (error) {
          console.warn('Error removing hCaptcha widget:', error);
        }
      }
    };
  }, [sitekey, theme, size, onVerify, onError, onExpire, onLoad]);

  const reset = () => {
    if (widgetId && window.hcaptcha) {
      window.hcaptcha.reset(widgetId);
    }
  };

  const getResponse = () => {
    if (widgetId && window.hcaptcha) {
      return window.hcaptcha.getResponse(widgetId);
    }
    return null;
  };

  return (
    <div className="hcaptcha-container">
      <div ref={captchaRef}></div>
      {!isLoaded && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-gray-600">Cargando CAPTCHA...</span>
        </div>
      )}
    </div>
  );
};

export default HCaptcha;