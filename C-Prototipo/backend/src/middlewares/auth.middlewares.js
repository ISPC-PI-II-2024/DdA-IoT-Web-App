// ==========================
// Middleware de protección Bearer <token>
// Inyecta req.user si el token es válido
// En modo desarrollo, permite acceso sin token
// ==========================
import { verifyAccessToken } from "../service/jwt.service.js";
import { ENV } from "../config/env.js";

export async function requireAuth(req, res, next) {
  try {
    // Modo desarrollo: permitir acceso sin token
    if (ENV.DEV_MODE === 'true') {
      req.user = {
        sub: "dev-user",
        email: ENV.DEV_USER_EMAIL,
        name: ENV.DEV_USER_NAME,
        role: "admin",
        devMode: true
      };
      console.log("🔧 Modo desarrollo: acceso sin autenticación");
      return next();
    }

    // Modo producción: verificar token
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No autorizado" });

    const payload = await verifyAccessToken(token);
    req.user = payload; // {sub, email, name, role, iat, exp}
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// ==========================
// Guardas por rol
// ==========================
export function requireRole(roles = []) {
  return (req, res, next) => {
    const role = req?.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: "Prohibido" });
    }
    next();
  };
}
