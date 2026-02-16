/**
 * Centralized API base URL helper.
 *
 * Convention:
 * - `VITE_API_URL` should be the BACKEND ORIGIN (no trailing slash), e.g.
 *   - "https://your-backend.up.railway.app"
 *   - "https://api.kaar.rentals"
 * - If `VITE_API_URL` is empty/undefined, requests will be relative ("/api/..."),
 *   so Vercel rewrites (or a same-origin reverse proxy) can handle routing.
 */
const RAW_API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
    ? String(import.meta.env.VITE_API_URL)
    : '';

export const API_ORIGIN = RAW_API_BASE.replace(/\/+$/, '');

export function joinUrl(base: string, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return p;
  return `${base.replace(/\/+$/, '')}${p}`;
}

/** Build a URL to the backend, including the "/api" prefix. */
export function apiUrl(path: string): string {
  return joinUrl(API_ORIGIN, path);
}

