/// <reference types="vite/client" />
// Base HTTP API client for communicating with API Gateway (YARP :5000)

//let activeBaseUrl: string = ((import.meta as any).env?.VITE_API_GATEWAY_URL || 'http://localhost:5000').replace(/\/+$/, '');
const isDevelopment = (import.meta as any).env?.DEV === true;

const configuredBaseUrl = (
  (import.meta as any).env?.VITE_API_GATEWAY_URL ?? ''
).trim().replace(/\/+$/, '');

let activeBaseUrl: string = configuredBaseUrl ||
  (isDevelopment ? 'http://localhost:5000' : '');

export function getApiBaseUrl(): string {
  return activeBaseUrl;
}

export function setApiBaseUrl(url: string): void {
  activeBaseUrl = url.replace(/\/+$/, '');
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = base ? `${base}${cleanEndpoint}` : cleanEndpoint;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> || {})
  };

  const controller = new AbortController();
  const timeoutMs = isFormData ? 60000 : 15000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 204) {
      return {} as T;
    }

    // Read body text once into memory so the stream is never consumed multiple times
    const rawText = await response.text();

    if (!response.ok) {
      let errorData: any = null;
      if (rawText && rawText.trim()) {
        try {
          errorData = JSON.parse(rawText);
        } catch {
          errorData = rawText;
        }
      }

      let message = `HTTP error ${response.status}: ${response.statusText}`;
      if (typeof errorData === 'object' && errorData !== null) {
        message = errorData.message || errorData.error || errorData.title || message;
      } else if (typeof errorData === 'string' && errorData.trim()) {
        const cleanText = errorData.replace(/<[^>]*>?/gm, '').trim();
        if (cleanText && cleanText.length < 200) {
          message = cleanText;
        }
      }

      if (response.status === 502 || response.status === 503) {
        message = `Service temporarily unavailable (${response.status} ${response.statusText}). Please ensure all backend microservices (including EmailService on port 5107) are running.`;
      }

      throw new ApiError(response.status, message, errorData);
    }

    if (!rawText || !rawText.trim()) {
      return {} as T;
    }

    try {
      return JSON.parse(rawText) as T;
    } catch {
      return rawText as unknown as T;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function checkGatewayHealth(): Promise<boolean> {
  const candidates = isDevelopment
    ? ['http://localhost:5000', '']
    : [''];

  for (const candidate of candidates) {
    const healthUrl = candidate
      ? `${candidate}/health`
      : '/health';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(healthUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => null);

          if (
            data &&
            (
              data.status?.toLowerCase() === 'healthy' ||
              data.gateway
            )
          ) {
            activeBaseUrl = candidate;
            return true;
          }
        } else {
          const text = await res.text().catch(() => '');

          if (
            !text.includes('<!DOCTYPE') &&
            (text.includes('Healthy') || text.includes('ApiGateway'))
          ) {
            activeBaseUrl = candidate;
            return true;
          }
        }
      }
    } catch {
      // Continue to the next candidate.
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return false;
}
