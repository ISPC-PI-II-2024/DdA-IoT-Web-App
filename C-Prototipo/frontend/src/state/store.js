// ==========================
// Estado global + Pub/Sub
// - user: { name, email } | null
// - role: admin | action | readonly | guest
// - currentProject: id/slug | null (preparado para multi-proyecto)
// ==========================
const ROLES = window.__CONFIG?.ROLES ?? { ADMIN: "admin", ACTION: "action", READONLY: "readonly", GUEST: "guest" };

const state = {
  user: null,
  role: ROLES.GUEST,
  currentProject: null
};

const subs = new Set();

export const getState = () => ({ ...state });
export const subscribe = fn => (subs.add(fn), () => subs.delete(fn));

function emit() { subs.forEach(fn => fn(getState())); }

export function setState(patch) {
  Object.assign(state, patch);
  emit();
}

export function login(user, role) {
  setState({ user, role });
}

export function logout() {
  setState({ user: null, role: ROLES.GUEST, currentProject: null });
}

export const ROLES_CONST = ROLES;
