/**
 * Layout raíz por idioma. Envuelve toda el área localizada (/es, /en),
 * valida el locale de la ruta y provee las traducciones (next-intl) a los
 * componentes cliente. Define <html>/<body> y los estilos globales.
 *
 * Tipografía:
 *   Una sola familia, Inter (300–900). Cubre cuerpo, interfaz y titulares:
 *   `--font-inter` alimenta tanto `font-sans` como `font-heading`.
 *
 * Tema:
 *   El claro es el predeterminado. El script inline aplica `.dark` antes del
 *   primer paint solo si la persona lo eligió antes.
 */
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
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
      className={inter.variable}
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
