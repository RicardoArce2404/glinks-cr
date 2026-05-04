import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/Protected";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { clientesApi, mantenimientoApi } from "@/services/api";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/mantenimiento")({
  component: () => (
    <Protected>
      <MantenimientoPage />
    </Protected>
  ),
});

function MantenimientoPage() {
  const { user } = useAuth();
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState<string>("all");
  const [form, setForm] = useState({ clienteId: "", descripcion: "", responsable: user?.name ?? "" });

  const clientes = clientesApi.list();
  const list = mantenimientoApi.list().filter((m) => filtro === "all" || m.clienteId === filtro);

  const submit = () => {
    if (!form.clienteId || !form.descripcion) { toast.error("Cliente y descripción requeridos"); return; }
    mantenimientoApi.create({ ...form, fecha: new Date().toISOString() });
    toast.success("Mantenimiento registrado");
    setOpen(false); setForm({ clienteId: "", descripcion: "", responsable: user?.name ?? "" }); refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mantenimiento</h1>
          <p className="text-muted-foreground text-sm">Registro de servicios técnicos</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Nuevo</Button>
      </div>

      <Card className="p-4">
        <div className="mb-4 max-w-sm">
          <Label className="mb-1.5 block">Filtrar por cliente</Label>
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          {list.map((m) => {
            const c = clientesApi.get(m.clienteId);
            return (
              <div key={m.id} className="p-3 border rounded-md flex flex-wrap justify-between gap-2">
                <div>
                  <div className="font-medium">{c?.nombre ?? "—"}</div>
                  <div className="text-sm text-muted-foreground">{m.descripcion}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{new Date(m.fecha).toLocaleString()}</div>
                  <div>Por: {m.responsable}</div>
                </div>
              </div>
            );
          })}
          {list.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Sin registros</p>}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo mantenimiento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Cliente</Label>
              <Select value={form.clienteId} onValueChange={(v) => setForm({ ...form, clienteId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>
            <div>
              <Label>Responsable</Label>
              <Input value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
