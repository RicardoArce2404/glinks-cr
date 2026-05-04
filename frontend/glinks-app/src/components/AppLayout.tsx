import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Wrench, Package, Receipt, LogOut, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOnline } from "@/hooks/useOnline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, type ReactNode } from "react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/mantenimiento", label: "Mantenimiento", icon: Wrench },
  { to: "/inventario", label: "Inventario", icon: Package },
  { to: "/facturacion", label: "Facturación", icon: Receipt },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { online, toggleForce } = useOnline();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <aside
        className={`${open ? "block" : "hidden"} md:block fixed md:static inset-y-0 left-0 z-30 w-64 bg-card border-r border-border`}
      >
        <div className="p-5 border-b border-border">
          <h1 className="text-lg font-bold tracking-tight">GLinks CR</h1>
          <p className="text-xs text-muted-foreground">Gestión ISP — Limón, CR</p>
        </div>
        <nav className="p-3 space-y-1">
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          <div className="text-sm font-medium">{user?.name}</div>
          <div className="text-xs text-muted-foreground capitalize mb-3">{user?.role}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" /> Salir
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
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
