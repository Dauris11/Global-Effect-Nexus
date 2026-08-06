/**
 * Contabilidad — módulo 14 del catálogo.
 *
 * Existe porque el Portal de Contabilidad no tenía a dónde llevar: sus dos
 * accesos apuntaban a `/administrativo` y `/dashboard`, y el rol
 * `contabilidad` solo tiene `finanzas.*` y `patrocinadores.leer` — no
 * `operaciones.leer`. Los dos enlaces daban en una puerta cerrada.
 *
 * El balance manda sobre el resto: es la cifra que se mira primero y la única
 * que cambia de color según su valor.
 */
import { requirePermission } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { listarTransacciones, balance } from "@/server/finanzas/queries";
import type { Transaccion, Balance } from "@/server/finanzas/types";
import { TablaTransacciones } from "./tabla";

export const dynamic = "force-dynamic";

export default async function ContabilidadPage() {
  await requirePermission("finanzas.leer");

  let transacciones: Transaccion[] = [];
  let bal: Balance = { ingresos: 0, egresos: 0, balance: 0, total: 0 };
  try {
    [transacciones, bal] = await Promise.all([listarTransacciones(), balance()]);
  } catch {
    /* Sin BD se pinta la pantalla con ceros y la tabla vacía. */
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Contabilidad"
        description="Ingresos, egresos y becas otorgadas."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="Wallet" label="Ingresos" value={bal.ingresos} format="currency" />
        <StatCard icon="Wallet" label="Egresos" value={bal.egresos} format="currency" />
        <StatCard
          icon="BarChart3"
          label="Balance"
          value={bal.balance}
          format="currency"
          accent={bal.balance < 0 ? "rojo" : "teal"}
        />
      </div>

      <TablaTransacciones transacciones={transacciones} />
    </div>
  );
}
