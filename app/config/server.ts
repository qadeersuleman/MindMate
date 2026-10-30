// app/config/server.ts
// Server Configuration

export const SERVER_IPS = {
  // 1. Primary Wi-Fi / LAN IP (Best for testing on physical Android/iOS devices connected to same Wi-Fi)
  LAN: '10.176.154.96',

  // 2. Docker default bridge gateway
  DOCKER: '172.17.0.1',

  // 3. Global IPv6 address (enclosed in brackets for URL syntax)
  IPV6: '[2404:3100:1400:8263:d900:9030:9379:4eb9]',

  // 4. Android Emulator default host loopback
  EMULATOR: '10.0.2.2',

  // 5. Localhost
  LOCALHOST: '127.0.0.1',
} as const;

// Set active IP here:
export const ACTIVE_SERVER_IP: string = SERVER_IPS.LAN;

// Ports
export const BACKEND_PORT = 8000;
export const FASTAPI_PORT = 8001;

// Base URLs
export const API_HOST = `http://${ACTIVE_SERVER_IP}:${BACKEND_PORT}`;
export const API_BASE_URL = `${API_HOST}/api/`;
export const FASTAPI_URL = `http://${ACTIVE_SERVER_IP}:${FASTAPI_PORT}`;

export default {
  SERVER_IPS,
  ACTIVE_SERVER_IP,
  BACKEND_PORT,
  FASTAPI_PORT,
  API_HOST,
  API_BASE_URL,
  FASTAPI_URL,
};
