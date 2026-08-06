/**
 * Tabla de transacciones con filtro por tipo.
 *
 * El monto es lo único coloreado —verde ingreso, rojo egreso— y lleva signo
 * delante: en una tabla de contabilidad el color solo no basta para distinguir
 * una entrada de una salida.
 *
 * El filtro es en cliente sobre la lista ya cargada. `listarTransacciones`
 * acepta un tipo y podría filtrar en servidor, pero eso costaría una ida y
 * vuelta por cada pulsación sobre un conjunto que cabe de sobra en memoria.
 */
"use client";

import { useMemo, useState } from "react";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Transaccion } from "@/server/finanzas/types";

const pesos = (n: number) =>
  new Intl.NumberFormat("es-DO", { maximumFractionDigits: 0 }).format(n);

export function TablaTransacciones({ transacciones }: { transacciones: Transaccion[] }) {
  const [tipo, setTipo] = useState("todos");

  const visibles = useMemo(
    () => (tipo === "todos" ? transacciones : transacciones.filter((t) => t.tipo === tipo)),
    [transacciones, tipo],
  );

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <Tabs value={tipo} onValueChange={setTipo}>
          <TabsList>
            <TabsTrigger value="todos">Todas</TabsTrigger>
            <TabsTrigger value="ingreso">Ingresos</TabsTrigger>
            <TabsTrigger value="egreso">Egresos</TabsTrigger>
          </TabsList>
        </Tabs>

        {visibles.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Sin transacciones"
            description={
              transacciones.length === 0
                ? "Todavía no hay movimientos registrados."
                : "Ningún movimiento coincide con el filtro."
            }
          />
        ) : (
          /* `overflow-x-auto`: la tabla tiene cinco columnas y en móvil se
             desplaza dentro de su caja en vez de romper la página. */
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {visibles.map((t) => {
                  const esIngreso = t.tipo === "ingreso";
                  const Icono = esIngreso ? TrendingUp : TrendingDown;
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-2">
                          <Icono
                            aria-hidden
                            className={
                              esIngreso
                                ? "h-4 w-4 shrink-0 text-emerald-600"
                                : "h-4 w-4 shrink-0 text-red-500"
                            }
                          />
                          {t.concepto}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="neutral" className="text-[10px] capitalize">
                          {t.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {format(new Date(t.fecha), "dd MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.referencia ?? "—"}
                      </TableCell>
                      <TableCell
                        className={
                          esIngreso
                            ? "whitespace-nowrap text-right font-bold text-emerald-600"
                            : "whitespace-nowrap text-right font-bold text-red-500"
                        }
                      >
                        {esIngreso ? "+" : "-"}${pesos(t.monto)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
