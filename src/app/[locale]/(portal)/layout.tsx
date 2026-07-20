/**
 * Layout del área autenticada (portal). Resuelve el usuario y su rol, filtra
 * la navegación por permisos (RBAC) y compone Sidebar + TopBar + contenido.
 * Si no hay sesión, redirige al login (el middleware ya protege, esto es la
 * segunda barrera en el servidor).
 */
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { permisosDeRol } from "@/lib/rbac";
import { NAV_ITEMS } from "@/lib/nav";
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

  // super_admin ve todo; el resto según sus permisos.
  const permisos = user.rol === "super_admin" ? null : await permisosDeRol(user.rol);
  const items = NAV_ITEMS.filter(
    (i) => !i.permiso || permisos === null || permisos.includes(i.permiso),
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={items} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar nombre={user.nombre} rol={user.rol} items={items} />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
