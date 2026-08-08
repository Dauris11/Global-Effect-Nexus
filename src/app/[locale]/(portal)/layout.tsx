/**
 * Layout del área autenticada (portal). Resuelve el usuario y su rol, filtra
 * la navegación por permisos (RBAC) y compone Sidebar + TopBar + contenido.
 * Si no hay sesión, redirige al login (el middleware ya protege, esto es la
 * segunda barrera en el servidor).
 */
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { permisosDeRol } from "@/lib/rbac";
import { portalNavPorRol } from "@/lib/nav";
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
  const items = portalNavPorRol(user.rol).filter((i) => {
    if (i.roles && !i.roles.includes(user.rol)) return false;
    if (permisos === null) return true;
    if (i.permiso && !permisos.includes(i.permiso)) return false;
    if (i.permisos && !i.permisos.some((p) => permisos.includes(p))) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#101322] transition-colors duration-300 font-inter">
      <Sidebar items={items} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6">
          <TopBar nombre={user.nombre} rol={user.rol} items={items} />
        </div>
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
