import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

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

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
      <Route path="/mantenimiento" element={<ProtectedRoute><MantenimientoPage /></ProtectedRoute>} />
      <Route path="/inventario" element={<ProtectedRoute><InventarioPage /></ProtectedRoute>} />
      <Route path="/facturacion" element={<ProtectedRoute><FacturacionPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}