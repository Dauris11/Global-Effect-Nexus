/**
 * Layout raíz por idioma. Envuelve toda el área localizada (/es, /en),
 * valida el locale de la ruta y provee las traducciones (next-intl) a los
 * componentes cliente. Define <html>/<body> y los estilos globales.
 *
 * Tipografía:
 *   - Inter (300–800): interfaz y titulares (`--font-inter` → `font-sans` y
 *     `font-display` en el tema).
 *   - JetBrains Mono: etiquetas, cifras y datos técnicos (`--font-jetbrains-mono`
 *     → `font-mono` en el tema).
 *
 * Tema oscuro:
 *   El script inline aplica la clase `dark` en <html> antes de pintar,
 *   leyendo localStorage("theme"). El ThemeToggle lo actualiza en tiempo real.
 */
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, JetBrains_Mono } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
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
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      {/* Anti-FOUC: aplica `.dark` antes del primer paint, leyendo la
          preferencia guardada. Por defecto el tema es oscuro (incluida la
          landing pública), salvo que la persona haya elegido claro antes. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"){document.documentElement.classList.add("dark");}}catch(e){document.documentElement.classList.add("dark");}})();`,
        }}
      />
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
