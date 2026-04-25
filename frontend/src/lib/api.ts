import axios, {
  AxiosError,
  AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from './env';
import type { ApiErrorBody } from './types';

const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  // Auth lives in httpOnly cookies; the browser must include them on every request.
  withCredentials: true,
});

/** Endpoints we never try to refresh-and-retry against (would loop forever). */
const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

interface RetriedRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

/** Single in-flight refresh promise so a burst of 401s only triggers one /refresh call. */
let refreshInFlight: Promise<void> | null = null;

async function attemptRefresh(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post(`${env.apiUrl}/auth/refresh`, null, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  await refreshInFlight;
}

/** Read the `csrf_token` cookie set by the backend on login/register/refresh. */
function readCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const SAFE_METHODS = new Set(['get', 'head', 'options']);

// Echo the CSRF cookie back as a header on every state-changing request.
// The backend's CsrfGuard rejects POST/PUT/PATCH/DELETE without a matching value.
api.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase();
  if (!SAFE_METHODS.has(method)) {
    const token = readCsrfTokenFromCookie();
    if (token) {
      config.headers.set('X-CSRF-Token', token);
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError<ApiErrorBody>) => {
    const original = err.config as RetriedRequestConfig | undefined;
    const status = err.response?.status;
    const url = original?.url ?? '';

    const skipRefresh = NO_REFRESH_PATHS.some((p) => url.includes(p));

    if (status === 401 && original && !original._retried && !skipRefresh) {
      original._retried = true;
      try {
        await attemptRefresh();
        return api.request(original);
      } catch {
        // refresh failed → fall through to logout flow below
      }
    }

    if (status === 401 && typeof window !== 'undefined' && !skipRefresh) {
      try {
        localStorage.removeItem('user');
      } catch {
        /* ignore */
      }
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  },
);

/** Fire-and-forget logout that clears server cookies too. */
export async function apiLogout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    /* server may already be unreachable; cookies clear on browser close anyway */
  }
}

/** Pulls a human-readable message out of an axios error. */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    const body = err.response?.data;
    if (body) {
      if (Array.isArray(body.message)) return body.message.join(', ');
      if (typeof body.message === 'string') return body.message;
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export type { AxiosRequestConfig };
export default api;
