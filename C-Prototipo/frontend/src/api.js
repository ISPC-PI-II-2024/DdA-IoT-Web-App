// ==========================
// Wrapper de fetch + helpers de Auth
// ==========================
import { storage } from "./utils/storage.js";
import { setState } from "./state/store.js";

const CFG = () => window.__CONFIG || {};
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const ROLE_KEY = "auth_role";

export function getToken() {
  return storage.get(TOKEN_KEY);
}
export function setSession({ accessToken, user, role }) {
  storage.set(TOKEN_KEY, accessToken, true); // sessionStorage
  storage.set(USER_KEY, user, true);
  storage.set(ROLE_KEY, role, true);
  setState({ user, role });
}
export function clearSession() {
  storage.del(TOKEN_KEY, true);
  storage.del(USER_KEY, true);
  storage.del(ROLE_KEY, true);
  setState({ user: null, role: "guest" });
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(`${CFG().API_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error("API error"), { status: res.status, data });
  return data;
}

// === Endpoints ===
export const AuthAPI = {
  googleLogin(credential) {
    return request("/auth/google", { method: "POST", body: { credential } });
  }
};
