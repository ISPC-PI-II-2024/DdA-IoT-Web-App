// ==========================
// /auth/google: recibe credential (ID token de Google),
// lo verifica contra JWKS de Google, resuelve rol y emite JWT propio.
// ==========================
import { createRemoteJWKSet, jwtVerify } from "jose";
import { ENV } from "../config/env.js";
import { resolveRoleByEmail } from "../service/user.service.js";
import { signAccessToken } from "../service/jwt.service.js";

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

    // 3) Resolver rol por listas blancas
    const role = resolveRoleByEmail(email);

    // 4) Emitir tu JWT (con rol embebido)
    const accessToken = await signAccessToken({
      sub: payload.sub,
      email,
      name,
      role
    });

    // 5) Responder
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
