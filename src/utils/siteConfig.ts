// Centralized site configuration utilities
// Use this to get consistent URLs across the entire application

/**
 * Get the main site URL from environment variables
 * Priority: NEXT_PUBLIC_SITE_URL > NEXTAUTH_URL > fallback
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 
         process.env.NEXTAUTH_URL || 
         "https://agente.aranza.io";
}

/**
 * Get just the domain without protocol
 */
export function getSiteDomain(): string {
  return getSiteUrl().replace(/https?:\/\//, '');
}

/**
 * Build a full URL with the site's base URL
 */
export function buildUrl(path: string): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Check if a URL belongs to this site
 */
export function isOwnDomain(url: string): boolean {
  const domain = getSiteDomain();
  return url.includes(domain);
}

/**
 * Get OAuth callback URL for a provider
 */
export function getOAuthCallbackUrl(provider: string): string {
  return buildUrl(`/api/auth/callback/${provider}`);
}

// Export constants for backwards compatibility
export const SITE_URL = getSiteUrl();
export const SITE_DOMAIN = getSiteDomain();