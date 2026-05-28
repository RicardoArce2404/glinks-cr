import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/Protected";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAllClients, physicalClientsApi, legalClientsApi } from "@/services/api/clientes";
import { productosApi } from "@/services/api/productos";
import {
  mantenimientosApi,
  fetchAllMaintenances,
  type CreateMaintenanceInput,
} from "@/services/api/mantenimientos";
import type { UnifiedClient, Product } from "@/models";
import { Plus, Loader2, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/mantenimiento")({
  component: () => (
    <Protected>
      <MantenimientoPage />
    </Protected>
  ),
});

interface MaintenanceProductInput {
  productId: string;
  amount: number;
  productName?: string;
}

function MantenimientoPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filterClientId, setFilterClientId] = useState<string>("all");
  const [form, setForm] = useState<{
    description: string;
    clientId: string;
    clientType: "fisico" | "juridico" | null;
    products: MaintenanceProductInput[];
  }>({
    description: "",
    clientId: "",
    clientType: null,
    products: [],
  });

  // Product selector state
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [productAmount, setProductAmount] = useState<number>(1);

  // Cargar clientes
  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["clientes", "todos"],
    queryFn: fetchAllClients,
  });

  // Cargar productos
  const { data: productsPage, isLoading: loadingProducts } = useQuery({
    queryKey: ["productos", "list"],
    queryFn: () => productosApi.list(1, 200),
  });
  const products = productsPage?.data ?? [];

  // Cargar mantenimientos
  const { data: mantData, isLoading: loadingMant } = useQuery({
    queryKey: ["mantenimientos", "todos"],
    queryFn: () => fetchAllMaintenances(1, 200),
  });

  const mantList = mantData?.data ?? [];

  // Filtrar mantenimientos por cliente
  const filteredMant = mantList.filter((m) => {
    if (filterClientId === "all") return true;
    const clientId = m.physical_client_id ?? m.legal_client_id;
    return clientId === filterClientId;
  });

  // Helper para obtener nombre del cliente
  const getClientName = (m: (typeof mantList)[number]) => {
    if (m.physical_client) {
      return `${m.physical_client.name} ${m.physical_client.last_name_1}`;
    }
    if (m.legal_client) {
      return m.legal_client.name;
    }
    const clientId = m.physical_client_id ?? m.legal_client_id;
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      return client.tipo === "fisico"
        ? `${client.name} ${client.last_name_1}`
        : client.name;
    }
    return "—";
  };

  // Agregar producto al formulario
  const addProduct = () => {
    if (!selectedProductId) {
      toast.error("Seleccione un producto");
      return;
    }
    if (productAmount < 1) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    // Verificar si ya existe el producto
    const existing = form.products.find((p) => p.productId === selectedProductId);
    if (existing) {
      setForm({
        ...form,
        products: form.products.map((p) =>
          p.productId === selectedProductId
            ? { ...p, amount: p.amount + productAmount }
            : p
        ),
      });
    } else {
      setForm({
        ...form,
        products: [
          ...form.products,
          {
            productId: selectedProductId,
            amount: productAmount,
            productName: product.name,
          },
        ],
      });
    }

    setSelectedProductId("");
    setProductAmount(1);
  };

  const removeProduct = (index: number) => {
    setForm({
      ...form,
      products: form.products.filter((_, i) => i !== index),
    });
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (!data.clientId || !data.clientType) {
        throw new Error("Debe seleccionar un cliente");
      }

      const input: CreateMaintenanceInput = {
        description: data.description,
        maintenanceProducts: data.products.map((p) => ({
          productId: p.productId,
          amount: p.amount,
        })),
      };

      if (data.clientType === "fisico") {
        return mantenimientosApi.createPhysical({
          ...input,
          physicalClientId: data.clientId,
        });
      } else {
        return mantenimientosApi.createLegal({
          ...input,
          legalClientId: data.clientId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mantenimientos"] });
      toast.success("Mantenimiento registrado correctamente");
      setOpen(false);
      setForm({
        description: "",
        clientId: "",
        clientType: null,
        products: [],
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    setForm({
      ...form,
      clientId: client.id,
      clientType: client.tipo,
      products: [], // Reset products when client changes
    });
  };

  const submit = () => {
    if (!form.clientId) {
      toast.error("Seleccione un cliente");
      return;
    }
    if (!form.description.trim()) {
      toast.error("La descripción es requerida");
      return;
    }
    if (form.products.length === 0) {
      toast.error("Agregue al menos un producto utilizado");
      return;
    }
    createMutation.mutate(form);
  };

  const loading = loadingMant || loadingClients;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mantenimiento</h1>
          <p className="text-muted-foreground text-sm">
            Registro de intervenciones técnicas y productos utilizados
          </p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={loadingClients || loadingProducts}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo mantenimiento
        </Button>
      </div>

      <Card className="p-4">
        <div className="mb-4 max-w-sm">
          <Label className="mb-1.5 block">Filtrar por cliente</Label>
          <Select value={filterClientId} onValueChange={setFilterClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.tipo === "fisico"
                    ? `${c.name} ${c.last_name_1} ${c.last_name_2}`
                    : c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMant.map((m) => {
              const clientName = getClientName(m);
              return (
                <div
                  key={m.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <div className="font-medium">{clientName}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {m.description}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{new Date(m.date).toLocaleString()}</div>
                      <div>Responsable: {m.responsible?.username ?? "—"}</div>
                    </div>
                  </div>

                  {/* Mostrar productos utilizados */}
                  {m.maintenanceProducts.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Productos utilizados:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {m.maintenanceProducts.map((mp) => (
                          <Badge key={mp.id} variant="secondary" className="text-xs">
                            {mp.product?.name ?? mp.product_id} x{mp.amount}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredMant.length === 0 && (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No hay registros de mantenimiento
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Dialog para nuevo mantenimiento */}
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar nuevo mantenimiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Selección de cliente */}
            <div>
              <Label>Cliente</Label>
              <Select
                value={form.clientId}
                onValueChange={handleClientChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.tipo === "fisico"
                        ? `${c.name} ${c.last_name_1} ${c.last_name_2}`
                        : c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Productos utilizados */}
            <div className="border rounded-md p-3 space-y-3">
              <Label>Productos utilizados</Label>
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-7">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} - ₡{p.unit_price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min={1}
                    value={productAmount}
                    onChange={(e) => setProductAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="Cantidad"
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    className="w-full"
                    onClick={addProduct}
                    disabled={!selectedProductId}
                    type="button"
                  >
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Lista de productos agregados */}
              <div className="space-y-1 mt-2">
                {form.products.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                  >
                    <span>
                      {p.productName} x{p.amount}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProduct(idx)}
                      type="button"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {form.products.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No hay productos agregados
                  </p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <Label>Descripción del trabajo realizado</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalle de la intervención técnica, fallas encontradas, soluciones aplicadas..."
                rows={4}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              El responsable se asigna automáticamente según el usuario que inició sesión.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={submit} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Registrar mantenimiento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}