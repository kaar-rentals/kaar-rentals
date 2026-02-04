import { io } from "socket.io-client";

/**
 * Vite: use import.meta.env.VITE_SOCKET_URL at build time for production.
 * If empty, io() will use the current origin (recommended when frontend+backend share origin).
 * Use `wss://` in the env for secure websockets if site is served over https.
 */
const SOCKET_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOCKET_URL) ? import.meta.env.VITE_SOCKET_URL : '';

export const socket = io(SOCKET_BASE, {
  path: '/socket.io',
  transports: ['websocket'],
  autoConnect: true,
});

export default socket;

