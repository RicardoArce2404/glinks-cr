import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "./AppLayout";

export function Protected({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <AppLayout>{children}</AppLayout>;
}
