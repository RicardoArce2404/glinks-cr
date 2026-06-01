import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Wrench, Package, Receipt, LogOut, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOnline } from "@/hooks/useOnline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, type ReactNode } from "react";
import type { Role } from "@/models";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: Role[];
}

// Configuración de menús con roles permitidos
const allItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, allowedRoles: ["admin"] },
  { to: "/clientes", label: "Clientes", icon: Users, allowedRoles: ["admin", "tecnico"] },
  { to: "/mantenimiento", label: "Mantenimiento", icon: Wrench, allowedRoles: ["admin", "tecnico"] },
  { to: "/inventario", label: "Inventario", icon: Package, allowedRoles: ["admin"] },
  { to: "/facturacion", label: "Facturación", icon: Receipt, allowedRoles: ["admin"] },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { online, toggleForce } = useOnline();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  // Filtrar items según el rol del usuario
  const items = allItems.filter((item) => {
    if (!user) return false;
    return item.allowedRoles.includes(user.role);
  });

  // Obtener nombre para mostrar
  const displayName = user?.name || user?.username || "Usuario";
  const roleLabel = user?.role === "admin" ? "Administrador" : "Técnico";

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <aside
        className={`${open ? "block" : "hidden"} md:block fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-border flex flex-col h-screen`}
      >
        <div className="flex flex-col flex-1">
          <div className="p-5 border-b border-border">
            <h1 className="text-lg font-bold tracking-tight">GLinks CR</h1>
            <p className="text-xs text-muted-foreground">Limón, CR</p>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto">
            {items.map((it) => {
              const active = path.startsWith(it.to);
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {it.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border bg-card">
          <div className="text-sm font-medium truncate">{displayName}</div>
          <div className="text-xs text-muted-foreground mb-3">{roleLabel}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" /> Salir
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-20">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            ☰
          </Button>
          <div className="flex-1" />
          <button
            onClick={toggleForce}
            className="flex items-center gap-2"
            title="Click para simular conexión"
          >
            <Badge variant={online ? "default" : "destructive"} className="gap-1">
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {online ? "En línea" : "Sin conexión"}
            </Badge>
          </button>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}