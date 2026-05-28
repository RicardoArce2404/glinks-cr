const BASE_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL ??
  "http://localhost:3000/api";

let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
}

export function getToken(): string | null {
  return token;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string> | undefined) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let json: any = null;

  try {
    json = await response.json();
  } catch {
    json = null;
  }

  // 401
  if (response.status === 401) {
    token = null;
    throw new Error("Sesión expirada. Inicie sesión nuevamente.");
  }

  // Error HTTP
  if (!response.ok) {
    throw new Error(
      json?.error ??
        json?.message ??
        `Error del servidor (${response.status})`,
    );
  }

  /**
   * SOPORTAR DIFERENTES RESPUESTAS DEL BACKEND
   */

  // Caso 1:
  // { success: true, data: ... }
  if (json?.success === true) {
    return json.data as T;
  }

  // Caso 2:
  // respuesta directa []
  if (Array.isArray(json)) {
    return json as T;
  }

  // Caso 3:
  // objeto directo {}
  if (typeof json === "object" && json !== null) {
    return json as T;
  }

  // Caso 4:
  // vacío
  return {} as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};