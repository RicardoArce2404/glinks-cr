import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/Protected";
import { Card } from "@/components/ui/card";
import { clientesApi, facturasApi, mantenimientoApi, productosApi } from "@/services/api";
import { Users, Wrench, Package, Receipt } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <Protected>
      <Dashboard />
    </Protected>
  ),
});

function Dashboard() {
  const clientes = clientesApi.list().length;
  const mant = mantenimientoApi.list().length;
  const productos = productosApi.list();
  const enUso = productos.filter((p) => p.estado === "en_uso").length;
  const facturas = facturasApi.list();
  const total = facturas.filter((f) => f.estado === "activa").reduce((s, f) => s + f.total, 0);

  const stats = [
    { label: "Clientes", value: clientes, icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { label: "Mantenimientos", value: mant, icon: Wrench, color: "bg-amber-500/10 text-amber-600" },
    { label: "Productos en uso", value: `${enUso}/${productos.length}`, icon: Package, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Facturado", value: `₡${total.toFixed(2)}`, icon: Receipt, color: "bg-purple-500/10 text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="font-semibold mb-3">Últimas facturas</h2>
        <div className="space-y-2">
          {facturas.slice(0, 5).map((f) => {
            const c = clientesApi.get(f.clienteId);
            return (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <div>
                  <div className="font-medium">{f.numero}</div>
                  <div className="text-xs text-muted-foreground">{c?.nombre ?? "—"}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₡{f.total.toFixed(2)}</div>
                  <div className={`text-xs ${f.estado === "anulada" ? "text-destructive" : "text-emerald-600"}`}>
                    {f.estado}
                  </div>
                </div>
              </div>
            );
          })}
          {facturas.length === 0 && <p className="text-sm text-muted-foreground">Sin facturas</p>}
        </div>
      </Card>
    </div>
  );
}
