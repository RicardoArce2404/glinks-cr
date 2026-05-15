import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/Protected";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  clientesFisicosApi,
  clientesJuridicosApi,
  fetchTodosClientes,
} from "@/services/api/clientes";
import { sectorialesApi, tiposAPApi } from "@/services/api/catalogos";
import type { ClienteUnificado, PlanTipo } from "@/models";
import { Plus, Pencil, Trash2, Eye, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/clientes")({
  component: () => (
    <Protected>
      <ClientesPage />
    </Protected>
  ),
});

// ─── Tipos del formulario unificado ───────────────

interface FormBase {
  domicilio: string;
  plan: PlanTipo;
  sectorialId: string;
  tipoAPId: string;
  routerId: number;
  poeId: number;
  telefonoPrimario: string;
  telefonoSecundario: string;
  email: string;
}

interface FormFisico extends FormBase {
  tipoCliente: "fisico";
  cedula: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
}

interface FormJuridico extends FormBase {
  tipoCliente: "juridico";
  cedulaJuridica: string;
  nombreEmpresa: string;
}

type FormState = FormFisico | FormJuridico;

const emptyBase: FormBase = {
  domicilio: "",
  plan: "4-4",
  sectorialId: "",
  tipoAPId: "",
  routerId: 0,
  poeId: 0,
  telefonoPrimario: "",
  telefonoSecundario: "",
  email: "",
};

const emptyFisico: FormFisico = {
  ...emptyBase,
  tipoCliente: "fisico",
  cedula: "",
  nombre: "",
  apellido1: "",
  apellido2: "",
};

const emptyJuridico: FormJuridico = {
  ...emptyBase,
  tipoCliente: "juridico",
  cedulaJuridica: "",
  nombreEmpresa: "",
};

// ─── Helpers de display ───────────────────────────

function clienteDisplayNombre(c: ClienteUnificado): string {
  if (c.tipo === "fisico") return `${c.nombre} ${c.apellido1}`;
  return c.nombreEmpresa;
}

function clienteDisplayDoc(c: ClienteUnificado): string {
  return c.tipo === "fisico" ? c.cedula : c.cedulaJuridica;
}

// ─── Página ───────────────────────────────────────

function ClientesPage() {
  const queryClient = useQueryClient();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClienteUnificado | null>(null);
  const [form, setForm] = useState<FormState>(emptyFisico);
  const [view, setView] = useState<ClienteUnificado | null>(null);

  // Catalogos para dropdowns
  const { data: sectoriales = [] } = useQuery({
    queryKey: ["catalogos", "sectoriales"],
    queryFn: () => sectorialesApi.list(),
    staleTime: 5 * 60_000,
  });

  const { data: tiposAP = [] } = useQuery({
    queryKey: ["catalogos", "tipos-ap"],
    queryFn: () => tiposAPApi.list(),
    staleTime: 5 * 60_000,
  });

  // Clientes
  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes", "todos"],
    queryFn: fetchTodosClientes,
    staleTime: 30_000,
  });

  const filtered = clientes.filter((c) => {
    if (!q) return true;
    const t = q.toLowerCase();
    const nombre = clienteDisplayNombre(c).toLowerCase();
    const doc = clienteDisplayDoc(c).toLowerCase();
    const sectorial = c.sectorial.nombre.toLowerCase();
    return nombre.includes(t) || doc.includes(t) || sectorial.includes(t);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // ─── Mutations ──────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (data: FormState) => {
      if (data.tipoCliente === "fisico") {
        const { tipoCliente, ...input } = data;
        return clientesFisicosApi.create(input);
      } else {
        const { tipoCliente, ...input } = data;
        return clientesJuridicosApi.create(input);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente registrado");
      setOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormState }) => {
      if (data.tipoCliente === "fisico") {
        const { tipoCliente, ...input } = data;
        return clientesFisicosApi.update(id, input);
      } else {
        const { tipoCliente, ...input } = data;
        return clientesJuridicosApi.update(id, input);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente actualizado");
      setOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (c: ClienteUnificado) => {
      if (c.tipo === "fisico") return clientesFisicosApi.remove(c.id);
      return clientesJuridicosApi.remove(c.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente eliminado");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ─── Handlers ───────────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm(emptyFisico);
    setOpen(true);
  };

  const openEdit = (c: ClienteUnificado) => {
    setEditing(c);
    if (c.tipo === "fisico") {
      setForm({
        tipoCliente: "fisico",
        cedula: c.cedula,
        nombre: c.nombre,
        apellido1: c.apellido1,
        apellido2: c.apellido2,
        telefonoPrimario: c.telefonoPrimario,
        telefonoSecundario: c.telefonoSecundario ?? "",
        email: c.email ?? "",
        domicilio: c.domicilio,
        plan: c.plan,
        sectorialId: c.sectorialId,
        tipoAPId: c.tipoAPId,
        routerId: c.routerId,
        poeId: c.poeId,
      });
    } else {
      setForm({
        tipoCliente: "juridico",
        cedulaJuridica: c.cedulaJuridica,
        nombreEmpresa: c.nombreEmpresa,
        telefonoPrimario: c.telefonoPrimario,
        telefonoSecundario: c.telefonoSecundario ?? "",
        email: c.email ?? "",
        domicilio: c.domicilio,
        plan: c.plan,
        sectorialId: c.sectorialId,
        tipoAPId: c.tipoAPId,
        routerId: c.routerId,
        poeId: c.poeId,
      });
    }
    setOpen(true);
  };

  const switchTipo = (t: "fisico" | "juridico") => {
    setForm(t === "fisico" ? emptyFisico : emptyJuridico);
  };

  const submit = () => {
    if (form.tipoCliente === "fisico") {
      if (!form.nombre || !form.cedula) {
        toast.error("Nombre y cédula requeridos");
        return;
      }
    } else {
      if (!form.nombreEmpresa || !form.cedulaJuridica) {
        toast.error("Nombre de empresa y cédula jurídica requeridos");
        return;
      }
    }
    if (!form.sectorialId) {
      toast.error("Selecciona una sectorial");
      return;
    }
    if (!form.tipoAPId) {
      toast.error("Selecciona un tipo de AP");
      return;
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const setFormField = <K extends keyof FormBase>(key: K, value: FormBase[K]) => {
    setForm({ ...form, [key]: value } as FormState);
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  // ─── Render ─────────────────────────────────

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm">Gestión de clientes del ISP</p>
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

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="text-muted-foreground">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Doc. identidad</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Plan</TableHead>
                  <TableHead className="hidden md:table-cell">Sectorial</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {clienteDisplayNombre(c)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {clienteDisplayDoc(c)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={c.tipo === "fisico" ? "default" : "secondary"}>
                        {c.tipo === "fisico" ? "Física" : "Jurídica"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{c.plan}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {c.sectorial.nombre}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setView(c)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(c)}
                        >
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
                              <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminarán también
                                sus mantenimientos y facturas asociadas.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(c)}
                              >
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
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Sin resultados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-muted-foreground">
                Página {page} de {totalPages} ({filtered.length} clientes)
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
          </>
        )}
      </Card>

      {/* ─── FORM MODAL ────────────────────────── */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) setOpen(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar cliente" : "Nuevo cliente"}
            </DialogTitle>
          </DialogHeader>

          {!editing && (
            <div className="flex gap-2">
              <Button
                variant={form.tipoCliente === "fisico" ? "default" : "outline"}
                size="sm"
                onClick={() => switchTipo("fisico")}
              >
                Persona física
              </Button>
              <Button
                variant={form.tipoCliente === "juridico" ? "default" : "outline"}
                size="sm"
                onClick={() => switchTipo("juridico")}
              >
                Persona jurídica
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {form.tipoCliente === "fisico" ? (
              <>
                <div>
                  <Label>Cédula</Label>
                  <Input
                    value={form.cedula}
                    onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Apellido 1</Label>
                  <Input
                    value={form.apellido1}
                    onChange={(e) => setForm({ ...form, apellido1: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Apellido 2</Label>
                  <Input
                    value={form.apellido2}
                    onChange={(e) => setForm({ ...form, apellido2: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Cédula jurídica</Label>
                  <Input
                    value={form.cedulaJuridica}
                    onChange={(e) => setForm({ ...form, cedulaJuridica: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Nombre de empresa</Label>
                  <Input
                    value={form.nombreEmpresa}
                    onChange={(e) => setForm({ ...form, nombreEmpresa: e.target.value })}
                  />
                </div>
              </>
            )}

            <div>
              <Label>Teléfono primario</Label>
              <Input
                value={form.telefonoPrimario}
                onChange={(e) => setFormField("telefonoPrimario", e.target.value)}
              />
            </div>
            <div>
              <Label>Teléfono secundario</Label>
              <Input
                value={form.telefonoSecundario}
                onChange={(e) => setFormField("telefonoSecundario", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setFormField("email", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Domicilio</Label>
              <Input
                value={form.domicilio}
                onChange={(e) => setFormField("domicilio", e.target.value)}
              />
            </div>
            <div>
              <Label>Sectorial</Label>
              <Select
                value={form.sectorialId}
                onValueChange={(v) => setFormField("sectorialId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sectorial" />
                </SelectTrigger>
                <SelectContent>
                  {sectoriales.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de AP</Label>
              <Select
                value={form.tipoAPId}
                onValueChange={(v) => setFormField("tipoAPId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo de AP" />
                </SelectTrigger>
                <SelectContent>
                  {tiposAP.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan</Label>
              <Select
                value={form.plan}
                onValueChange={(v) => setFormField("plan", v as PlanTipo)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="4-4">4-4</SelectItem>
                  <SelectItem value="6-6">6-6</SelectItem>
                  <SelectItem value="8-8">8-8</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Router ID</Label>
              <Input
                type="number"
                value={form.routerId || ""}
                onChange={(e) => setFormField("routerId", +e.target.value)}
              />
            </div>
            <div>
              <Label>PoE ID</Label>
              <Input
                type="number"
                value={form.poeId || ""}
                onChange={(e) => setFormField("poeId", +e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editing ? "Guardar" : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── VIEW MODAL ────────────────────────── */}
      <Dialog open={!!view} onOpenChange={(v) => !v && setView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {view ? clienteDisplayNombre(view) : ""}
            </DialogTitle>
          </DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              <Row
                label="Tipo"
                value={view.tipo === "fisico" ? "Persona física" : "Persona jurídica"}
              />
              <Row
                label={view.tipo === "fisico" ? "Cédula" : "Cédula jurídica"}
                value={clienteDisplayDoc(view)}
              />
              {view.tipo === "fisico" && (
                <Row label="Nombre completo" value={`${view.nombre} ${view.apellido1} ${view.apellido2}`} />
              )}
              <Row label="Teléfono" value={view.telefonoPrimario} />
              {view.telefonoSecundario && <Row label="Teléfono 2" value={view.telefonoSecundario} />}
              {view.email && <Row label="Email" value={view.email} />}
              <Row label="Domicilio" value={view.domicilio} />
              <Row label="Plan" value={view.plan} />
              <Row label="Sectorial" value={view.sectorial.nombre} />
              <Row label="Tipo AP" value={view.tipoAP.nombre} />
              <Row label="Router ID" value={String(view.routerId)} />
              <Row label="PoE ID" value={String(view.poeId)} />
              <Row
                label="Registrado"
                value={new Date(view.createdAt).toLocaleDateString()}
              />
            </div>
          )}
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
