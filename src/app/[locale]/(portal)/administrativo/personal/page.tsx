/**
 * Gestión de personal — ClickUp S9 · #450–451.
 *
 * Tres bloques: las cifras del equipo (#450), el reparto por rol (#451) y la
 * tabla de personas con la carga de trabajo que tiene cada una (#450).
 *
 * La columna de carga es el motivo de que esta pantalla exista y no baste con
 * la lista de usuarios de Configuración: al asignar una tarea hay que saber
 * quién está ya desbordado, y eso no se ve en una lista de correos.
 *
 * Permiso: `usuarios.administrar`. Quien no lo tenga ve un aviso y el camino de
 * vuelta, no un error de servidor: la ruta está enlazada desde el portal y
 * llegar aquí sin permiso es un accidente normal, no un ataque.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Lock, ShieldCheck, Users } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { listarPersonal, resumenPersonal } from "@/server/usuarios/queries";
import type { PersonaDelEquipo } from "@/server/usuarios/queries";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ChipEstado } from "@/components/ui/chip-estado";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const RESUMEN_VACIO = {
  total: 0,
  activos: 0,
  inactivos: 0,
  nunca_entro: 0,
  por_rol: [] as { rol: string; descripcion: string | null; total: number }[],
};

async function cargar() {
  try {
    const [resumen, personas] = await Promise.all([resumenPersonal(), listarPersonal()]);
    return { resumen, personas };
  } catch {
    return { resumen: RESUMEN_VACIO, personas: [] as PersonaDelEquipo[] };
  }
}

export default async function PersonalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [puedeAdministrar, t] = await Promise.all([
    can(user.rol, "usuarios.administrar"),
    getTranslations("staff"),
  ]);

  if (!puedeAdministrar) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow={t("eyebrow")} title={t("title")} />
        <EmptyState
          icon={Lock}
          title={t("forbidden")}
          description={t("forbiddenHint")}
          action={
            <Button variant="outline" asChild>
              <Link href={`/${locale}/administrativo`}>
                <ArrowLeft aria-hidden />
                {t("backToHub")}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const { resumen, personas } = await cargar();

  const cifras = [
    { clave: "total", valor: resumen.total, alerta: false },
    { clave: "active", valor: resumen.activos, alerta: false },
    { clave: "inactive", valor: resumen.inactivos, alerta: false },
    { clave: "neverSignedIn", valor: resumen.nunca_entro, alerta: resumen.nunca_entro > 0 },
  ] as const;

  /**
   * Nombre traducido del rol. Los roles viven en la base de datos y el
   * diccionario podría quedarse corto si alguien añade uno; en ese caso se
   * muestra el código tal cual en vez de romper la página.
   */
  const nombreDeRol = (rol: string) =>
    t.has(`roleName.${rol}` as never) ? t(`roleName.${rol}` as never) : rol;

  const fechaHora = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />
      </div>

      {/* Cifras del equipo — #450 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cifras.map((c, i) => (
          <Card
            key={c.clave}
            className={cn(
              "animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out border-l-[3px] p-5",
              c.alerta ? "border-l-prioridad-alta" : "border-l-border",
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <p className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {t(`stats.${c.clave}` as never)}
            </p>
            <p
              className={cn(
                "mt-2 tabular-nums text-3xl font-semibold tabular-nums",
                c.alerta ? "text-prioridad-alta" : "text-foreground",
              )}
            >
              {c.valor}
            </p>
          </Card>
        ))}
      </div>

      {/* Reparto por rol — #451 */}
      <section className="space-y-3">
        <h2 className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {t("roles")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resumen.por_rol.map((r, i) => (
            <Card
              key={r.rol}
              className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out p-4"
              style={{ animationDelay: `${180 + i * 30}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <ShieldCheck className="size-3.5 shrink-0 text-primary" aria-hidden />
                    {nombreDeRol(r.rol)}
                  </p>
                  {r.descripcion && (
                    <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
                      {r.descripcion}
                    </p>
                  )}
                </div>
                <span className="shrink-0 tabular-nums text-xl font-semibold tabular-nums">
                  {r.total}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Personas y su carga — #450 */}
      <section className="space-y-3">
        <h2 className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {t("people")}
        </h2>

        {personas.length === 0 ? (
          <EmptyState icon={Users} title={t("empty")} description={t("emptyHint")} />
        ) : (
          <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{t("column.person")}</TableHead>
                  <TableHead scope="col">{t("column.role")}</TableHead>
                  <TableHead scope="col" className="text-right">
                    {t("column.load")}
                  </TableHead>
                  <TableHead scope="col">{t("column.lastAccess")}</TableHead>
                  <TableHead scope="col">{t("column.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personas.map((p) => (
                  <TableRow key={p.id} className={cn(!p.activo && "opacity-60")}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar nombre={p.nombre} tamano="md" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{p.nombre}</p>
                          <p className="truncate text-[13px] text-muted-foreground">
                            {p.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-[13px]">
                      {nombreDeRol(p.rol)}
                    </TableCell>

                    {/* La carga: tareas abiertas y, si hay, cuántas ya vencieron.
                        El rojo es de las vencidas, no del volumen: tener diez
                        tareas al día no es un problema. */}
                    <TableCell className="text-right">
                      <span className="tabular-nums text-sm tabular-nums">
                        {p.tareas_abiertas}
                      </span>
                      {p.tareas_vencidas > 0 && (
                        <ChipEstado estado="prioridad-urgente" className="ml-2">
                          {t("overdue", { count: p.tareas_vencidas })}
                        </ChipEstado>
                      )}
                    </TableCell>

                    <TableCell className="tabular-nums text-[13px] tabular-nums text-muted-foreground">
                      {p.ultimo_acceso
                        ? fechaHora.format(new Date(p.ultimo_acceso))
                        : t("never")}
                    </TableCell>

                    <TableCell>
                      <ChipEstado
                        estado={p.activo ? "tarea-completada" : "tarea-cancelada"}
                        punto
                      >
                        {p.activo ? t("status.active") : t("status.inactive")}
                      </ChipEstado>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <p className="text-[13px] text-muted-foreground">{t("inviteHint")}</p>
      </section>
    </div>
  );
}
