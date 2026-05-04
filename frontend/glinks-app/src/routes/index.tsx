import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: () => {
    const { user } = useAuth();
    return <Navigate to={user ? "/dashboard" : "/login"} />;
  },
});
