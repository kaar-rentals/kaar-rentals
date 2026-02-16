import { io } from "socket.io-client";
import { API_ORIGIN } from "@/lib/apiBase";

/**
 * Vite: use import.meta.env.VITE_SOCKET_URL at build time for production.
 * If empty, io() will use the current origin (recommended when frontend+backend share origin).
 * Use `wss://` in the env for secure websockets if site is served over https.
 */
const RAW_SOCKET =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOCKET_URL)
    ? String(import.meta.env.VITE_SOCKET_URL)
    : '';

// Prefer explicit socket URL; otherwise, try the API origin.
// If neither is set, we disable auto-connect to avoid noisy failures on Vercel.
const SOCKET_BASE = (RAW_SOCKET || API_ORIGIN).replace(/\/+$/, '');

const socketOptions = {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  autoConnect: Boolean(SOCKET_BASE),
};

export const socket = SOCKET_BASE ? io(SOCKET_BASE, socketOptions) : io(socketOptions);

export default socket;

