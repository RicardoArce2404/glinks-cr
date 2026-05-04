import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/Protected";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "@/components/ui/table";

import { useEffect, useState } from "react";
import { productosApi } from "@/services/api";
import type { Producto, ProductoTipo, ProductoEstado } from "@/models";
import { Plus, Pencil, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { useOnline } from "@/hooks/useOnline";

export const Route = createFileRoute("/inventario")({
  component: () => (
    <Protected>
      <InventarioPage />
    </Protected>
  ),
});

const empty: Omit<Producto, "id"> = {
  nombre: "",
  tipo: "Router",
  serial: "",
  estado: "disponible",
  stock: 0,
  precio: 0,
};

function InventarioPage() {
  const { online } = useOnline();
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const [pending, setPending] = useState(0);
  const [q, setQ] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState<Omit<Producto, "id">>(empty);

  useEffect(() => {
    setPending(productosApi.pendingCount());
  }, []);

  const productos = productosApi.list().filter((p) => {
    const t = q.toLowerCase();
    const matchQ =
      !t ||
      p.nombre.toLowerCase().includes(t) ||
      p.serial.toLowerCase().includes(t);
    const matchT = filtroTipo === "all" || p.tipo === filtroTipo;
    return matchQ && matchT;
  });

  const total = productosApi.list().length;
  const enUso = productosApi.list().filter(
    (p) => p.estado === "en_uso"
  ).length;

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (p: Producto) => {
    setEditing(p);
    setForm(p);
    setOpen(true);
  };

  const submit = () => {
    if (!form.nombre) {
      toast.error("Nombre requerido");
      return;
    }

    if (editing) productosApi.update(editing.id, form, !online);
    else productosApi.create(form, !online);

    if (!online) {
      toast.warning("Guardado en modo offline");
      setPending(productosApi.pendingCount());
    } else {
      toast.success(
        editing ? "Producto actualizado" : "Producto registrado"
      );
    }

    setOpen(false);
    refresh();
  };

  const sync = () => {
    const n = productosApi.sync();
    setPending(0);
    refresh();
    toast.success(`${n} cambios sincronizados`);
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-muted-foreground text-sm">
            Routers y equipos PoE
          </p>
        </div>

        <div className="flex gap-2">
          {pending > 0 && (
            <Button variant="outline" onClick={sync}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar ({pending})
            </Button>
          )}

          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{total}</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">En uso</div>
          <div className="text-2xl font-bold">{enUso}</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Disponibles
          </div>
          <div className="text-2xl font-bold">
            {total - enUso}
          </div>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="p-4">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Router">Router</SelectItem>
              <SelectItem value="PoE">PoE</SelectItem>
              <SelectItem value="Antena AP">Antena AP</SelectItem>
              <SelectItem value="Tubo metálico">Tubo metálico</SelectItem>
              <SelectItem value="Cable">Cable</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="text-muted-foreground">
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden md:table-cell">
                Serial
              </TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {productos.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {p.nombre}
                </TableCell>
                <TableCell>{p.tipo}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {p.serial}
                </TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      p.estado === "disponible"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {p.estado === "disponible"
                      ? "Disponible"
                      : "En uso"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {productos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Sin productos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nombre</Label>
              <Input
                value={form.nombre}
                onChange={(e) =>
                  setForm({ ...form, nombre: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) =>
                  setForm({ ...form, tipo: v as ProductoTipo })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Router">Router</SelectItem>
                  <SelectItem value="PoE">PoE</SelectItem>
                  <SelectItem value="Antena AP">Antena AP</SelectItem>
                  <SelectItem value="Tubo metálico">Tubo metálico</SelectItem>
                  <SelectItem value="Cable">Cable</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estado</Label>
              <Select
                value={form.estado}
                onValueChange={(v) =>
                  setForm({ ...form, estado: v as ProductoEstado })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="en_uso">En uso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Serial</Label>
              <Input
                value={form.serial}
                onChange={(e) =>
                  setForm({ ...form, serial: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: +e.target.value })
                }
              />
            </div>

            <div className="col-span-2">
              <Label>Precio</Label>
              <Input
                type="number"
                value={form.precio}
                onChange={(e) =>
                  setForm({ ...form, precio: +e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submit}>
              {editing ? "Guardar" : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}