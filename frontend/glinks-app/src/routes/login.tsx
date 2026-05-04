import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Network } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(u, p, remember);
    if (!res.ok) setErr(res.error ?? "Error");
    else navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Network className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">GLinks CR</h1>
            <p className="text-sm text-muted-foreground">Sistema de gestión interna</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="u">Usuario</Label>
            <Input id="u" value={u} onChange={(e) => setU(e.target.value)} placeholder="admin o tecnico" />
          </div>
          <div>
            <Label htmlFor="p">Contraseña</Label>
            <Input id="p" type="password" value={p} onChange={(e) => setP(e.target.value)} placeholder="1234" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="r" checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
            <Label htmlFor="r" className="text-sm font-normal cursor-pointer">Recordarme</Label>
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" className="w-full">Ingresar</Button>
        </form>
      </Card>
    </div>
  );
}
