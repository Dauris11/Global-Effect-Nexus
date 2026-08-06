/**
 * Portal de Contabilidad — control financiero y becas.
 *
 * Los KPI del banner se envuelven (`kpisEnvueltos`) en vez de repartirse con
 * divisores: los montos en pesos son mucho más largos que un conteo y con
 * divisores fijos se salen del banner en pantallas medianas.
 *
 * El balance se pinta en rojo cuando es negativo. Es la única cifra del
 * sistema que cambia de color por su valor, y por eso vale la pena.
 */
import { DollarSign, FileBarChart, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BannerRol } from "@/components/portal/banner-rol";
import { AccesosRapidos, type AccesoRapido } from "@/components/portal/accesos-rapidos";
import { CardLista, ItemLista, EstadoVacio } from "@/components/portal/card-lista";
import { listarTransacciones, balance } from "@/server/finanzas/queries";
import type { Transaccion, Balance } from "@/server/finanzas/types";

export const dynamic = "force-dynamic";

const ACCESOS: AccesoRapido[] = [
  {
    href: "/administrativo",
    icono: Wallet,
    titulo: "Contabilidad",
    descripcion: "Ingresos, egresos y categorías",
    azulejo: "bg-violet-50 text-violet-600",
  },
  {
    href: "/dashboard",
    icono: FileBarChart,
    titulo: "Reportes",
    descripcion: "Balance y evolución mensual",
    azulejo: "bg-blue-50 text-blue-600",
  },
];

/** Formato dominicano: separador de miles y sin decimales para los KPI. */
const pesos = (n: number) =>
  `$${new Intl.NumberFormat("es-DO", { maximumFractionDigits: 0 }).format(n)}`;

export default async function PortalContabilidadPage() {
  let transacciones: Transaccion[] = [];
  let bal: Balance = { ingresos: 0, egresos: 0, balance: 0, total: 0 };
  try {
    [transacciones, bal] = await Promise.all([listarTransacciones(), balance()]);
  } catch {
    /* Sin BD el portal se pinta con estados vacíos. */
  }

  const ultimas = transacciones.slice(0, 6);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <BannerRol
        icono={DollarSign}
        titulo="Portal de Contabilidad"
        subtitulo="Control financiero y gestión de becas"
        gradiente="bg-gradient-to-br from-violet-500 to-violet-700"
        kpisEnvueltos
        kpis={[
          { valor: pesos(bal.ingresos), label: "Ingresos" },
          { valor: pesos(bal.egresos), label: "Egresos" },
          {
            valor: pesos(bal.balance),
            label: "Balance",
            tono: bal.balance < 0 ? "text-red-300" : undefined,
          },
        ]}
      />

      <AccesosRapidos accesos={ACCESOS} columnas="sm:grid-cols-3" />

      <CardLista titulo="Últimas Transacciones" icono={Wallet}>
        {ultimas.length === 0 ? (
          <EstadoVacio mensaje="No hay transacciones registradas." />
        ) : (
          ultimas.map((tx) => {
            const esIngreso = tx.tipo === "ingreso";
            return (
              <ItemLista
                key={tx.id}
                icono={esIngreso ? TrendingUp : TrendingDown}
                azulejo={
                  esIngreso ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                }
                titulo={tx.concepto}
                detalle={`${format(new Date(tx.fecha), "dd MMM yyyy", { locale: es })} · ${tx.categoria}`}
                derecha={
                  <span
                    className={
                      esIngreso
                        ? "text-sm font-bold text-emerald-600"
                        : "text-sm font-bold text-red-500"
                    }
                  >
                    {esIngreso ? "+" : "-"}
                    {pesos(tx.monto)}
                  </span>
                }
              />
            );
          })
        )}
      </CardLista>
    </div>
  );
}
