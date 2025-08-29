// hCaptcha Configuration
// This file provides fallback configuration when environment variables are not available

export const getHCaptchaSiteKey = (): string => {
  // Try to get from environment variables first
  const envKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
  
  if (envKey && envKey.trim() !== '') {
    console.log('✅ Using hCaptcha key from environment variables');
    return envKey;
  }
  
  // Fallback configuration for production
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    console.log('⚠️ Using fallback hCaptcha key - configure NEXT_PUBLIC_HCAPTCHA_SITE_KEY for better security');
    return '3c8c7fc4-1566-44ca-bb54-809c2f2657b6';
  }
  
  console.error('❌ No hCaptcha site key available');
  return '';
};

export const isHCaptchaConfigured = (): boolean => {
  const key = getHCaptchaSiteKey();
  return key !== '';
};