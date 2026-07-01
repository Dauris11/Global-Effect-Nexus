import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { pool } from "./db";

/**
 * Configuración de Auth.js (NextAuth v5): proveedor de credenciales
 * (email + contraseña) con sesiones JWT. El rol viaja en el token para
 * que middleware y rbac.ts decidan el acceso.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const { rows } = await pool.query(
          `SELECT u.id, u.email, u.nombre, u.password_hash, u.activo, r.nombre AS rol
             FROM usuario u JOIN rol r ON r.id = u.rol_id
            WHERE u.email = $1`,
          [String(creds.email)],
        );
        const u = rows[0];
        if (!u || !u.activo) return null;
        const ok = await bcrypt.compare(String(creds.password), u.password_hash);
        if (!ok) return null;
        return { id: u.id, email: u.email, name: u.nombre, rol: u.rol };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.rol = (user as { rol?: string }).rol;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { rol?: string }).rol = token.rol as string;
      return session;
    },
  },
});
