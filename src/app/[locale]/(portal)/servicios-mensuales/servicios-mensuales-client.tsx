"use client";

import { useState } from "react";
import { format } from "date-fns";

export function ServiciosMensualesClient() {
  const [mes, setMes] = useState(format(new Date(), "yyyy-MM"));

  return (
    <div>
      <p>Selector de mes y tabla irán aquí.</p>
      <p>Mes seleccionado: {mes}</p>
    </div>
  );
}
