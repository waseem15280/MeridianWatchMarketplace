/// <reference types="vite/client" />
// Base HTTP API client for communicating with API Gateway (YARP :5000)

let activeBaseUrl: string = ((import.meta as any).env?.VITE_API_GATEWAY_URL || 'http://localhost:5000').replace(/\/+$/, '');

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

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new ApiError(response.status, `HTTP error ${response.status}: ${response.statusText}`, errorData);
    }

    return await response.json() as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function checkGatewayHealth(): Promise<boolean> {
  const envUrl = (((import.meta as any).env?.VITE_API_GATEWAY_URL || '') as string).trim().replace(/\/+$/, '');
  const candidateUrls: string[] = [];

  // Build candidate probing URLs in order of preference
  if (activeBaseUrl && !candidateUrls.includes(activeBaseUrl)) {
    candidateUrls.push(activeBaseUrl);
  }
  if (envUrl && !candidateUrls.includes(envUrl)) {
    candidateUrls.push(envUrl);
  }
  if (!candidateUrls.includes('http://localhost:5000')) {
    candidateUrls.push('http://localhost:5000');
  }
  if (!candidateUrls.includes('http://127.0.0.1:5000')) {
    candidateUrls.push('http://127.0.0.1:5000');
  }
  // Also try relative path (covers Vite proxy on localhost:3000 / localhost:5173 or same-origin deployment)
  if (typeof window !== 'undefined' && !candidateUrls.includes('')) {
    candidateUrls.push('');
  }

  for (const candidate of candidateUrls) {
    const healthUrl = candidate ? `${candidate}/health` : '/health';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(healthUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => null);
          if (data && (data.status?.toLowerCase() === 'healthy' || data.gateway)) {
            activeBaseUrl = candidate;
            return true;
          }
        } else {
          // If response is not JSON (e.g. text/plain), verify keywords and ensure it is not HTML
          const text = await res.text().catch(() => '');
          if (!text.includes('<!DOCTYPE') && (text.includes('Healthy') || text.includes('ApiGateway'))) {
            activeBaseUrl = candidate;
            return true;
          }
        }
      }
    } catch {
      clearTimeout(timeoutId);
      // Try next candidate
    }
  }

  return false;
}
