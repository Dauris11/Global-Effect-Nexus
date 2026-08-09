/**
 * Layout del área autenticada (portal). Resuelve el usuario y su rol, filtra
 * la navegación por permisos (RBAC) y compone Sidebar + TopBar + contenido.
 * Si no hay sesión, redirige al login (el middleware ya protege, esto es la
 * segunda barrera en el servidor).
 */
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { permisosDeRol } from "@/lib/rbac";
import { filtrarNav, portalNavPorRol, portalThemePorRol } from "@/lib/nav";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  // Los portales ya no se construyen con el menú del sistema. Cada rol obtiene
  // su colección de enlaces y el layout se ambienta a esa navegación.
  const permisos = user.rol === "super_admin" ? null : await permisosDeRol(user.rol);
  const items = filtrarNav(portalNavPorRol(user.rol), user.rol, permisos);

  const theme = portalThemePorRol(user.rol);

  return (
    <div
      className="flex min-h-screen bg-slate-50 dark:bg-[#101322] transition-colors duration-300 font-inter"
      style={
        {
          "--portal-sidebar": theme.sidebar,
          "--portal-sidebar-edge": theme.sidebarEdge,
          "--portal-primary": theme.primary,
          "--portal-primary-foreground": theme.primaryForeground,
          "--portal-hover": theme.hover,
          "--portal-hover-soft": theme.hoverSoft,
          "--portal-page": theme.page,
          "--portal-page-text": theme.pageText,
        } as React.CSSProperties
      }
    >
      <Sidebar items={items} rol={user.rol} theme={theme} />

      <div className="flex min-w-0 flex-1 flex-col px-6 md:px-10">
        <div className="mx-auto w-full max-w-[1600px]">
          <TopBar nombre={user.nombre} rol={user.rol} items={items} theme={theme} />
        </div>
        <main className="mx-auto w-full max-w-[1600px] flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
