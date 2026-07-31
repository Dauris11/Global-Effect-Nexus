/**
 * Layout raíz por idioma. Envuelve toda el área localizada (/es, /en),
 * valida el locale de la ruta y provee las traducciones (next-intl) a los
 * componentes cliente. Define <html>/<body> y los estilos globales.
 */
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import "../globals.css";

// Sin sistema tipográfico: el proyecto está sin estilos a propósito, así que
// se usa la fuente por defecto del navegador. Antes se auto-hospedaban
// Montserrat (UI), Fraunces (titulares) y JetBrains Mono (cifras) con
// `next/font/google`; se quitaron con el resto de las decisiones visuales.
// Dejarlas habría descargado tres familias que ninguna regla usaba.

export const metadata: Metadata = {
  title: "Global Effect Nexus",
  description: "Plataforma de gestión de la Fundación Global Effect",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* Se quitó el script que aplicaba el tema guardado antes de pintar: sin
          tokens ni variante `dark`, poner esa clase en <html> no cambia nada.
          Vuelve cuando el sistema nuevo tenga tema oscuro. */}
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
