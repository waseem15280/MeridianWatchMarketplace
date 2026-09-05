// Base HTTP API client for communicating with API Gateway (YARP :5000)

const BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

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
  try {
    const res = await fetch(`${BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

