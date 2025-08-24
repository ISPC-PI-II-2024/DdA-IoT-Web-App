// ==========================
// Resolución de rol por email usando listas blancas
// - admin: en ADMIN_WHITELIST
// - action: en ACTION_WHITELIST
// - readonly: default
// ==========================
import { ENV } from "../config/env.js";

export function resolveRoleByEmail(email) {
  const e = (email || "").toLowerCase();
  if (ENV.ADMIN_WHITELIST.includes(e)) return "admin";
  if (ENV.ACTION_WHITELIST.includes(e)) return "action";
  return "readonly";
}
