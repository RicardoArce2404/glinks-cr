import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Role } from "@/models";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(KEY_TOKEN) ?? sessionStorage.getItem(KEY_TOKEN);
    const savedUserStr = localStorage.getItem(KEY_USER) ?? sessionStorage.getItem(KEY_USER);
    const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;

    if (!savedToken || !savedUser) {
      setLoading(false);
      return;
    }

    setToken(savedToken);

    fetch(
      `${(import.meta as { env?: Record<string, string> }).env?.VITE_API_URL ?? "http://localhost:3000/api"}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      },
    )
      .then((res) => {
        if (!res.ok) throw new Error("Token inválido");
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          setUser(savedUser);
        } else {
          throw new Error("Token inválido");
        }
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem(KEY_TOKEN);
        localStorage.removeItem(KEY_USER);
        sessionStorage.removeItem(KEY_TOKEN);
        sessionStorage.removeItem(KEY_USER);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (
    username: string,
    password: string,
    remember: boolean,
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const baseUrl =
        (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL ??
        "http://localhost:3000/api";

      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();

      if (!json.success) {
        return { ok: false, error: json.error ?? "Credenciales inválidas" };
      }

      const { token, user: apiUser } = json.data;

      // Asegurar que el usuario tenga un nombre para mostrar
      const userWithName = {
        ...apiUser,
        name: apiUser.name || apiUser.username,
      };

      setToken(token);

      if (remember) {
        localStorage.setItem(KEY_TOKEN, token);
        localStorage.setItem(KEY_USER, JSON.stringify(userWithName));
      } else {
        sessionStorage.setItem(KEY_TOKEN, token);
        sessionStorage.setItem(KEY_USER, JSON.stringify(userWithName));
      }

      setUser(userWithName);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Error de conexión",
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_USER);
    sessionStorage.removeItem(KEY_TOKEN);
    sessionStorage.removeItem(KEY_USER);
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