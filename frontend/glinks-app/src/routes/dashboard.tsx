import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/Protected";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { physicalClientsApi, legalClientsApi } from "@/services/api/clientes";
import { productosApi } from "@/services/api/productos";
import { facturasApi, calculateInvoiceTotals } from "@/services/api/facturas";
import { fetchAllMaintenances } from "@/services/api/mantenimientos";
import { Users, Wrench, Package, Receipt } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <Protected>
      <Dashboard />
    </Protected>
  ),
});

function Dashboard() {
  const { data: physicalPage, isLoading: loadingPhysical } = useQuery({
    queryKey: ["clientes-fisicos", "count"],
    queryFn: () => physicalClientsApi.list(1, 1),
  });

  const { data: legalPage, isLoading: loadingLegal } = useQuery({
    queryKey: ["clientes-juridicos", "count"],
    queryFn: () => legalClientsApi.list(1, 1),
  });

  const { data: productsPage, isLoading: loadingProducts } = useQuery({
    queryKey: ["productos", "list"],
    queryFn: () => productosApi.list(1, 200),
  });

  const { data: invoicesPage, isLoading: loadingInvoices } = useQuery({
    queryKey: ["facturas", "list"],
    queryFn: () => facturasApi.list(1, 100),
  });

  const { data: mantData, isLoading: loadingMant } = useQuery({
    queryKey: ["mantenimientos", "count"],
    queryFn: () => fetchAllMaintenances(1, 1),
  });

  const loading =
    loadingPhysical ||
    loadingLegal ||
    loadingProducts ||
    loadingInvoices ||
    loadingMant;

  const totalClients = (physicalPage?.total ?? 0) + (legalPage?.total ?? 0);
  const totalMaintenances = mantData?.total ?? 0;
  const totalProducts = productsPage?.data.length ?? 0;
  const billableProducts = productsPage?.data.filter((p) => p.billable).length ?? 0;

  // Calcular total facturado en facturas activas (sin anuladas)
  const totalBilled =
    invoicesPage?.data.reduce((sum, inv) => {
      const { total } = calculateInvoiceTotals(inv);
      return sum + total;
    }, 0) ?? 0;

  const stats = [
    {
      label: "Clientes",
      value: totalClients,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Mantenimientos",
      value: totalMaintenances,
      icon: Wrench,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Productos",
      value: loading ? "…" : `${billableProducts} / ${totalProducts}`,
      subtitle: "facturables / total",
      icon: Package,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Total facturado",
      value: loading ? "…" : `₡${totalBilled.toFixed(2)}`,
      icon: Receipt,
      color: "bg-purple-500/10 text-purple-600",
    },
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
            <div
              className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}
            >
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-7 w-16" /> : s.value}
            </div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
            {s.subtitle && (
              <div className="text-xs text-muted-foreground mt-1">{s.subtitle}</div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="font-semibold mb-3">Últimas facturas</h2>
        {loadingInvoices ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : invoicesPage && invoicesPage.data.length > 0 ? (
          <div className="space-y-2">
            {invoicesPage.data.slice(0, 5).map((inv) => {
              const clientName = inv.physicalClient
                ? `${inv.physicalClient.name} ${inv.physicalClient.last_name_1}`
                : inv.legalClient?.name ?? "—";
              const { total } = calculateInvoiceTotals(inv);
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                >
                  <div>
                    <div className="font-medium">{new Date(inv.date).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">{clientName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₡{total.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay facturas registradas
          </p>
        )}
      </Card>
    </div>
  );
}