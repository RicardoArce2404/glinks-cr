import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";

import LoginPage from "./login";
import DashboardPage from "./dashboard";
import ClientesPage from "./clientes";
import MantenimientoPage from "./mantenimiento";
import InventarioPage from "./inventario";
import FacturacionPage from "./facturacion";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

export function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Redirigir técnicos de / a /clientes
  const getDefaultRoute = () => {
    if (!user) return "/login";
    if (user.role === "tecnico") return "/clientes";
    return "/dashboard";
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />}
      />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={["admin"]}>
            <DashboardPage />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/clientes" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
      <Route path="/mantenimiento" element={<ProtectedRoute><MantenimientoPage /></ProtectedRoute>} />
      <Route path="/inventario" element={
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={["admin"]}>
            <InventarioPage />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/facturacion" element={
        <ProtectedRoute>
          <RoleBasedRoute allowedRoles={["admin"]}>
            <FacturacionPage />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}