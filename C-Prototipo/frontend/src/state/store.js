const state = { user: null, role: "guest" };
const subs = new Set();
export const getState = () => ({ ...state });
export const subscribe = fn => (subs.add(fn), () => subs.delete(fn));
export const setState = patch => {
  Object.assign(state, patch);
  subs.forEach(fn => fn(getState()));
};