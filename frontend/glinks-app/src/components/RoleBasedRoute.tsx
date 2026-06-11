import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/models";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallbackPath?: string;
}

export function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = "/dashboard" 
}: RoleBasedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}