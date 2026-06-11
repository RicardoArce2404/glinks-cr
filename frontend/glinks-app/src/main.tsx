import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SyncProvider } from "@/components/SyncProvider"; 
import { Toaster } from "@/components/ui/sonner";
import { AppRoutes } from "./routes";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SyncProvider>
          <AppRoutes />
          <Toaster />
        </SyncProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);