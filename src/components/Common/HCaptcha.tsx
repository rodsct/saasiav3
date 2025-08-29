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
  const [scriptError, setScriptError] = useState<string>('');

  useEffect(() => {
    console.log('HCaptcha useEffect triggered with sitekey:', sitekey);
    
    const loadHCaptcha = () => {
      console.log('Attempting to load hCaptcha widget...');
      if (window.hcaptcha && captchaRef.current) {
        console.log('hCaptcha API and ref available, rendering widget...');
        try {
          const id = window.hcaptcha.render(captchaRef.current, {
            sitekey,
            theme,
            size,
            callback: (token: string) => {
              console.log('hCaptcha callback triggered with token');
              onVerify(token);
            },
            'error-callback': (err: any) => {
              console.error('hCaptcha error:', err);
              onError?.();
            },
            'expired-callback': () => {
              console.log('hCaptcha expired');
              onExpire?.();
            },
          });
          console.log('hCaptcha widget rendered with ID:', id);
          setWidgetId(id);
          setIsLoaded(true);
          onLoad?.();
        } catch (error) {
          console.error('Error rendering hCaptcha:', error);
          setScriptError('Error rendering hCaptcha widget');
        }
      } else {
        console.warn('hCaptcha API or captchaRef not available');
      }
    };

    if (window.hcaptcha) {
      console.log('hCaptcha already loaded, rendering immediately');
      loadHCaptcha();
    } else {
      console.log('hCaptcha not loaded, attempting to load script...');
      // Load hCaptcha script if not already loaded
      const existingScript = document.querySelector('script[src*="hcaptcha.com/1/api.js"]');
      if (!existingScript) {
        console.log('Creating hCaptcha script element...');
        const script = document.createElement('script');
        script.src = 'https://js.hcaptcha.com/1/api.js?onload=hCaptchaOnLoad&render=explicit';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log('hCaptcha script loaded successfully');
        };
        
        script.onerror = (error) => {
          console.error('Error loading hCaptcha script:', error);
          setScriptError('Failed to load hCaptcha script');
        };
        
        window.hCaptchaOnLoad = () => {
          console.log('hCaptcha onload callback triggered');
          loadHCaptcha();
        };
        
        document.head.appendChild(script);
        console.log('hCaptcha script added to head');
      } else {
        console.log('hCaptcha script already exists, waiting for API...');
        // Script already loaded, check if hcaptcha is available
        const checkHCaptcha = setInterval(() => {
          if (window.hcaptcha) {
            console.log('hCaptcha API now available');
            clearInterval(checkHCaptcha);
            loadHCaptcha();
          }
        }, 100);
        
        // Clear interval after 10 seconds if not loaded
        setTimeout(() => {
          clearInterval(checkHCaptcha);
          if (!window.hcaptcha) {
            console.error('hCaptcha failed to load within 10 seconds');
            setScriptError('hCaptcha failed to load within timeout');
          }
        }, 10000);
      }
    }

    return () => {
      if (widgetId && window.hcaptcha) {
        try {
          console.log('Removing hCaptcha widget:', widgetId);
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

  if (scriptError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 text-sm font-medium">❌ Error cargando hCaptcha</p>
        <p className="text-red-500 text-xs mt-1">{scriptError}</p>
      </div>
    );
  }

  return (
    <div className="hcaptcha-container">
      <div ref={captchaRef} className="hcaptcha-widget"></div>
      {!isLoaded && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-gray-600">Cargando hCaptcha...</span>
        </div>
      )}
    </div>
  );
};

export default HCaptcha;