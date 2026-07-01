/**
 * Route handler de Auth.js (NextAuth v5). Expone los endpoints de
 * autenticación (login, callback, sesión, logout) bajo /api/auth/*.
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
