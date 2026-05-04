import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@/models";
import { storage } from "@/services/storage";

interface AuthCtx {
  user: User | null;
  login: (username: string, password: string, remember: boolean) => { ok: boolean; error?: string };
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "erp_session";

const MOCK = [
  { username: "admin", password: "1234", role: "admin" as const, name: "Administrador" },
  { username: "tecnico", password: "1234", role: "tecnico" as const, name: "Técnico" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = storage.get<User | null>(KEY, null);
    if (saved) setUser(saved);
  }, []);

  const login = (username: string, password: string, remember: boolean) => {
    const found = MOCK.find((m) => m.username === username && m.password === password);
    if (!found) return { ok: false, error: "Credenciales inválidas" };
    const u: User = { username: found.username, role: found.role, name: found.name };
    setUser(u);
    if (remember) storage.set(KEY, u);
    else sessionStorage.setItem(KEY, JSON.stringify(u));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    storage.remove(KEY);
    sessionStorage.removeItem(KEY);
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
