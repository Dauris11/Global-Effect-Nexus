"use client";

import { useEffect, useState, useTransition } from "react";
import { cambiarRolDiseno } from "@/server/auth/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles } from "lucide-react";

const ROLES = [
  { rol: "estudiante", label: "🎓 Estudiante", path: "/portal/estudiante" },
  { rol: "psicologo", label: "🧠 Psicología", path: "/portal/psicologia" },
  { rol: "docente", label: "👨‍🏫 Profesor", path: "/portal/profesor" },
  { rol: "administrativo", label: "📋 Administrativo", path: "/portal/administrativo" },
  { rol: "contabilidad", label: "💰 Contabilidad", path: "/portal/contabilidad" },
  { rol: "admin", label: "⚙️ Admin General", path: "/dashboard" },
];

export function SelectorRolDiseno({
  rolActual,
  locale,
}: {
  rolActual: string;
  locale: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 outline-none hover:bg-amber-500/20 transition-all cursor-pointer"
        title="Cambiar de portal en Modo Diseño"
      >
        <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
        <span className="capitalize">{rolActual.replace(/_/g, " ")}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-lg">
        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Modo Diseño: Cambiar Rol
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((r) => (
          <DropdownMenuItem
            key={r.rol}
            onClick={() => {
              startTransition(() => {
                cambiarRolDiseno(r.rol, locale);
              });
            }}
            className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium ${
              rolActual === r.rol
                ? "bg-slate-100 dark:bg-zinc-800 font-bold text-primary"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            {r.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
