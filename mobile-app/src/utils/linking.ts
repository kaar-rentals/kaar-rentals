import { EXTERNAL_URL_PATTERNS, WEBSITE_BASE_URL } from '../config/constants';

export function isInternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const base = new URL(WEBSITE_BASE_URL);
    return parsed.hostname === base.hostname;
  } catch {
    return false;
  }
}

export function shouldOpenExternally(url: string): boolean {
  if (!url || url === 'about:blank') return false;
  return EXTERNAL_URL_PATTERNS.some((pattern) => pattern.test(url));
}

export function toAbsoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${WEBSITE_BASE_URL}${normalized}`;
}
