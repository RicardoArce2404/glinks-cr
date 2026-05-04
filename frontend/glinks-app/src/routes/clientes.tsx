import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/Protected";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "@/components/ui/table";

import { useState } from "react";
import { clientesApi, mantenimientoApi } from "@/services/api";
import type { Cliente } from "@/models";
import { Plus, Pencil, Trash2, Eye, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/clientes")({
  component: () => (
    <Protected>
      <ClientesPage />
    </Protected>
  ),
});

const empty: Omit<Cliente, "id" | "createdAt"> = {
  nombre: "",
  cedula: "",
  contacto: "",
  domicilio: "",
  plan: "",
  sectorial: "",
  tipoAP: "",
};

function ClientesPage() {
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState(empty);
  const [view, setView] = useState<Cliente | null>(null);

  const list = clientesApi.list().filter((c) => {
    const t = q.toLowerCase();
    return (
      !t ||
      c.nombre.toLowerCase().includes(t) ||
      c.cedula.includes(t) ||
      c.sectorial.toLowerCase().includes(t)
    );
  });

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const paged = list.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (c: Cliente) => {
    setEditing(c);
    setForm(c);
    setOpen(true);
  };

  const submit = () => {
    if (!form.nombre || !form.cedula) {
      toast.error("Nombre y cédula requeridos");
      return;
    }

    if (editing) {
      clientesApi.update(editing.id, form);
      toast.success("Cliente actualizado");
    } else {
      clientesApi.create(form);
      toast.success("Cliente registrado");
    }

    setOpen(false);
    refresh();
  };

  const remove = (c: Cliente) => {
    clientesApi.remove(c.id);
    toast.success("Cliente eliminado");
    refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm">
            Gestión de clientes del ISP
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo cliente
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre, cédula o sectorial"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="text-muted-foreground">
              <TableHead>Nombre</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead className="hidden md:table-cell">Plan</TableHead>
              <TableHead className="hidden md:table-cell">Sectorial</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paged.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nombre}</TableCell>
                <TableCell>{c.cedula}</TableCell>
                <TableCell className="hidden md:table-cell">{c.plan}</TableCell>
                <TableCell className="hidden md:table-cell">{c.sectorial}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setView(c)}>
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Eliminar cliente?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(c)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      {/* MODAL FORM */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar cliente" : "Nuevo cliente"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              ["nombre", "Nombre"],
              ["cedula", "Cédula"],
              ["contacto", "Contacto"],
              ["domicilio", "Domicilio"],
              ["plan", "Plan"],
              ["sectorial", "Sectorial"],
              ["tipoAP", "Tipo de AP"],
            ] as const).map(([k, lbl]) => (
              <div key={k} className={k === "domicilio" ? "sm:col-span-2" : ""}>
                <Label>{lbl}</Label>
                <Input
                  value={form[k]}
                  onChange={(e) =>
                    setForm({ ...form, [k]: e.target.value })
                  }
                />
              </div>
            ))}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}