import React from "react";
import { PrematriculaClient } from "./prematricula-client";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prematrícula — Portal Estudiante",
  description: "Selección de materias para el próximo periodo académico.",
};

export default async function PrematriculaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);
  
  return <PrematriculaClient />;
}
