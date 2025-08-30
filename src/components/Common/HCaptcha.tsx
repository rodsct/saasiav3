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

  // Create stable refs for callbacks to prevent re-renders
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);
  const onLoadRef = useRef(onLoad);

  // Update refs when callbacks change
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
    onLoadRef.current = onLoad;
  }, [onVerify, onError, onExpire, onLoad]);

  useEffect(() => {
    console.log('HCaptcha useEffect triggered with sitekey:', sitekey);
    
    // Don't re-render if already loaded and verified
    if (isLoaded && widgetId) {
      console.log('hCaptcha already loaded and rendered, skipping...');
      return;
    }
    
    // Cleanup function to remove existing widget
    const cleanupExistingWidget = () => {
      if (widgetId && window.hcaptcha) {
        try {
          console.log('Cleaning up existing hCaptcha widget:', widgetId);
          window.hcaptcha.remove(widgetId);
        } catch (error) {
          console.warn('Error removing existing hCaptcha widget:', error);
        }
      }
      setWidgetId(null);
      setIsLoaded(false);
    };
    
    const loadHCaptcha = () => {
      console.log('Attempting to load hCaptcha widget...');
      
      // Don't reload if already rendered
      if (widgetId && window.hcaptcha) {
        console.log('hCaptcha widget already exists, skipping render');
        return;
      }
      
      // First cleanup any existing widget
      cleanupExistingWidget();
      
      if (window.hcaptcha && captchaRef.current) {
        console.log('hCaptcha API and ref available, rendering widget...');
        
        // Clear the container first
        if (captchaRef.current) {
          captchaRef.current.innerHTML = '';
        }
        
        try {
          const id = window.hcaptcha.render(captchaRef.current, {
            sitekey,
            theme,
            size,
            callback: (token: string) => {
              console.log('hCaptcha callback triggered with token - KEEPING WIDGET');
              onVerifyRef.current(token);
              // Don't reset the widget after verification
            },
            'error-callback': (err: any) => {
              console.error('hCaptcha error-callback triggered:', err);
              setScriptError('hCaptcha error: ' + (err?.message || err || 'Unknown error'));
              onErrorRef.current?.(err);
            },
            'expired-callback': () => {
              console.log('hCaptcha expired - will need new verification');
              onExpireRef.current?.();
            },
          });
          console.log('hCaptcha widget rendered with ID:', id);
          setWidgetId(id);
          setIsLoaded(true);
          onLoadRef.current?.();
        } catch (error) {
          console.error('Error rendering hCaptcha:', error);
          setScriptError('Error rendering hCaptcha widget: ' + error);
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
      console.log('HCaptcha cleanup triggered');
      if (widgetId && window.hcaptcha) {
        try {
          console.log('Removing hCaptcha widget:', widgetId);
          window.hcaptcha.remove(widgetId);
        } catch (error) {
          console.warn('Error removing hCaptcha widget:', error);
        }
      }
      // Clear the container
      if (captchaRef.current) {
        captchaRef.current.innerHTML = '';
      }
      setWidgetId(null);
      setIsLoaded(false);
    };
  }, [sitekey, theme, size]); // Removed callback dependencies to prevent re-renders

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
    <div className="hcaptcha-container" key={`hcaptcha-${sitekey}`}>
      <div ref={captchaRef} className="hcaptcha-widget" id={`hcaptcha-${Date.now()}`}></div>
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