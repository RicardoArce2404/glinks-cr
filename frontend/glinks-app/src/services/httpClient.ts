const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
}

export function getToken(): string | null {
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string> | undefined) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    const savedToken = localStorage.getItem("erp_token") ?? sessionStorage.getItem("erp_token");
    if (savedToken) {
      token = savedToken;
      headers["Authorization"] = `Bearer ${token}`;
    }
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

  if (response.status === 401) {
    token = null;
    throw new Error("Sesión expirada. Inicie sesión nuevamente.");
  }

  if (!response.ok) {
    // Extraer mensaje de error específico
    let errorMessage = `Error del servidor (${response.status})`;
    
    if (json?.error) {
      errorMessage = json.error;
    } else if (json?.message) {
      errorMessage = json.message;
    } else if (json?.errors && Array.isArray(json.errors) && json.errors.length > 0) {
      errorMessage = json.errors[0].message;
    }

    throw new Error(errorMessage);
  }

  return json as T;
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