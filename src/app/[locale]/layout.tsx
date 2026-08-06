/**
 * Layout raíz por idioma. Envuelve toda el área localizada (/es, /en),
 * valida el locale de la ruta y provee las traducciones (next-intl) a los
 * componentes cliente. Define <html>/<body> y los estilos globales.
 *
 * Tipografía:
 *   - Fraunces (serif variable): titulares. Es lo que le da carácter editorial
 *     y cálido a la identidad (`--font-fraunces` → `font-display`).
 *   - Inter: cuerpo e interfaz (`--font-inter` → `font-sans`).
 *   No se auto-hospeda ninguna monoespaciada: el sistema nuevo no usa
 *   etiquetas monoespaciadas como decoración.
 *
 * Tema:
 *   El claro ("Esperanza") es el predeterminado. El script inline aplica
 *   `.dark` ("Espresso", oscuro cálido) antes del primer paint solo si la
 *   persona lo eligió antes; el ThemeToggle lo actualiza en tiempo real.
 */
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Fraunces, Inter } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

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
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <head>
        {/* Anti-FOUC: el claro es el predeterminado, así que solo hay que
            adelantarse cuando la persona pidió el oscuro explícitamente. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("theme")==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
