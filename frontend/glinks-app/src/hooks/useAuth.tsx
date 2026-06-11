import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/models";
import { setToken } from "@/services/httpClient";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (
    username: string,
    password: string,
    remember: boolean,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY_USER = "erp_user";
const KEY_TOKEN = "erp_token";

const BASE_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL ??
  "http://localhost:3000/api";

function clearSession() {
  setToken(null);
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_USER);
  sessionStorage.removeItem(KEY_TOKEN);
  sessionStorage.removeItem(KEY_USER);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Solo mostrar spinner si hay token guardado — evita el bloqueo infinito
  const [loading, setLoading] = useState(() => {
    return !!(
      localStorage.getItem(KEY_TOKEN) ?? sessionStorage.getItem(KEY_TOKEN)
    );
  });

  useEffect(() => {
    const savedToken =
      localStorage.getItem(KEY_TOKEN) ?? sessionStorage.getItem(KEY_TOKEN);
    const savedUserStr =
      localStorage.getItem(KEY_USER) ?? sessionStorage.getItem(KEY_USER);
    const savedUser: User | null = savedUserStr
      ? JSON.parse(savedUserStr)
      : null;

    if (!savedToken || !savedUser) {
      setLoading(false);
      return;
    }

    setToken(savedToken);

    // Timeout de seguridad: libera el loading si el servidor no responde en 8s
    const timeout = setTimeout(() => {
      clearSession();
      setLoading(false);
    }, 8000);

    fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token inválido");
        return res.json();
      })
      .then((json) => {
        if (json?.success) {
          setUser(savedUser);
        } else {
          clearSession();
        }
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, []);

  const login = async (
    username: string,
    password: string,
    remember: boolean,
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();

      if (!res.ok || !json?.success) {
        return { ok: false, error: json?.error ?? "Credenciales inválidas" };
      }

      const { token, user: apiUser } = json.data as {
        token: string;
        user: User;
      };

      // Asegurar que siempre haya un nombre para mostrar
      const userWithName: User = {
        ...apiUser,
        name: apiUser.name || (apiUser as any).username,
      };

      setToken(token);
      setUser(userWithName);

      if (remember) {
        localStorage.setItem(KEY_TOKEN, token);
        localStorage.setItem(KEY_USER, JSON.stringify(userWithName));
      } else {
        sessionStorage.setItem(KEY_TOKEN, token);
        sessionStorage.setItem(KEY_USER, JSON.stringify(userWithName));
      }

      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Error de conexión",
      };
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}