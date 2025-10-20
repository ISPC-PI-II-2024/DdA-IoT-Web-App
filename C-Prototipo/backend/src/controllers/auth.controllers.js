// ==========================
// /auth/google: recibe credential (ID token de Google),
// lo verifica contra JWKS de Google, resuelve rol y emite JWT propio.
// ==========================
import { createRemoteJWKSet, jwtVerify } from "jose";
import { ENV } from "../config/env.js";
import { resolveRoleByEmail } from "../service/user.service.js";
import { signAccessToken } from "../service/jwt.service.js";
import { pool } from "../db/index.js";

// JWKS de Google (cacheado por jose)
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function googleAuth(req, res) {
  try {
    const { credential } = req.body || {};
    if (!credential) return res.status(400).json({ error: "credential requerido" });

    // 1) Verificar el ID Token de Google (audience = tu client_id)
    const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: ENV.GOOGLE_CLIENT_ID
    });

    // 2) Extraer identidad
    const email = payload.email;
    const name = payload.name || payload.given_name || "";
    if (!email || !payload.email_verified) {
      return res.status(403).json({ error: "Email no verificado en Google" });
    }

    // 3) Resolver rol por base de datos
    const role = await resolveRoleByEmail(email);

    // 4) Actualizar último login en la base de datos
    try {
      const conn = await pool.getConnection();
      await conn.query(
        'UPDATE usuarios_google SET ultimo_login = NOW() WHERE mail = ?',
        [email.toLowerCase()]
      );
      conn.release();
    } catch (dbError) {
      console.error("Error actualizando último login:", dbError);
      // No fallar la autenticación por este error
    }

    // 5) Emitir tu JWT (con rol embebido)
    const accessToken = await signAccessToken({
      sub: payload.sub,
      email,
      name,
      role
    });

    // 6) Responder
    return res.json({
      user: { email, name },
      role,
      accessToken,
      tokenType: "Bearer",
      expiresIn: ENV.JWT_EXPIRES_IN
    });
  } catch (err) {
    console.error("auth/google error:", err);
    return res.status(401).json({ error: "Token inválido" });
  }
}

// ==========================
// Endpoint de desarrollo para login local sin Google
// Solo disponible cuando DEV_MODE=true
// ==========================
export async function devLogin(req, res) {
  try {
    // Verificar que estemos en modo desarrollo
    if (ENV.DEV_MODE !== 'true') {
      return res.status(404).json({ error: "Endpoint no disponible en producción" });
    }

    console.log("🔧 Login de desarrollo activado");

    // Usar credenciales de desarrollo
    const email = ENV.DEV_USER_EMAIL;
    const name = ENV.DEV_USER_NAME;
    const role = "admin"; // Siempre admin en modo desarrollo

    // Asegurar que el usuario de desarrollo existe en la DB
    try {
      const conn = await pool.getConnection();
      const existingUser = await conn.query(
        'SELECT id FROM usuarios_google WHERE mail = ?',
        [email.toLowerCase()]
      );
      
      if (existingUser.length === 0) {
        // Crear usuario de desarrollo
        await conn.query(
          'INSERT INTO usuarios_google (mail, admin, action, activo) VALUES (?, TRUE, TRUE, TRUE)',
          [email.toLowerCase()]
        );
        console.log(`👤 Usuario de desarrollo creado: ${email}`);
      } else {
        // Actualizar usuario existente para asegurar permisos de admin
        await conn.query(
          'UPDATE usuarios_google SET admin = TRUE, action = TRUE, ultimo_login = NOW() WHERE mail = ?',
          [email.toLowerCase()]
        );
      }
      conn.release();
    } catch (dbError) {
      console.error("Error manejando usuario de desarrollo:", dbError);
      // Continuar aunque falle la DB
    }

    // Generar JWT para desarrollo
    const accessToken = await signAccessToken({
      sub: "dev-user-" + Date.now(),
      email,
      name,
      role
    });

    // Responder
    return res.json({
      user: { email, name },
      role,
      accessToken,
      tokenType: "Bearer",
      expiresIn: ENV.JWT_EXPIRES_IN,
      devMode: true,
      message: "Login de desarrollo exitoso"
    });

  } catch (err) {
    console.error("dev/login error:", err);
    return res.status(500).json({ error: "Error en login de desarrollo" });
  }
}
