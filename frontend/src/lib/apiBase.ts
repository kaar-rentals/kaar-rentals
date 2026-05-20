/**
 * Centralized API base URL helper.
 *
 * Convention:
 * - `VITE_API_URL` may be the backend origin OR origin + `/api` (both work).
 *   Examples: `https://your-backend.onrender.com` or `https://kaar.rentals/api`
 * - If empty, requests use relative paths (`/api/...`) for Vercel rewrites.
 */
const RAW_API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
    ? String(import.meta.env.VITE_API_URL).trim()
    : '';

/** Backend origin without trailing slash or duplicate `/api` suffix */
export const API_ORIGIN = RAW_API_BASE.replace(/\/+$/, '').replace(/\/api$/i, '');

export function joinUrl(base: string, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return p;
  return `${base.replace(/\/+$/, '')}${p}`;
}

/** Build a URL to the backend, including exactly one `/api` prefix. */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const apiPath = p.startsWith('/api') ? p : `/api${p}`;
  return joinUrl(API_ORIGIN, apiPath);
}
