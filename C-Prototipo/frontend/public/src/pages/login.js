// ==========================
// Login con Google (GIS)
// - Carga dinámica de script GIS si falta
// - Renderiza botón y maneja callback
// - Dev fallback: login simulado por rol (opcional)
// ==========================
import { el } from "../utils/dom.js";
import { setState, ROLES_CONST } from "../state/store.js";
import { AuthAPI, setSession } from "../api.js";

function loadGIS() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts && window.google.accounts.id) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar GIS"));
    document.head.appendChild(s);
  });
}

async function initGoogle(container) {
  const { GOOGLE_CLIENT_ID } = window.__CONFIG || {};
  if (!GOOGLE_CLIENT_ID) {
    container.appendChild(el("p", { class: "muted" }, "Falta GOOGLE_CLIENT_ID en config. Usa el login simulado."));
    return;
  }
  await loadGIS();

  // Inicializar GIS
  /* global google */
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (resp) => {
      try {
        const data = await AuthAPI.googleLogin(resp.credential);
        setSession(data); // guarda token + user + role y setState()
        location.hash = "#/dashboard";
      } catch (e) {
        console.error(e);
        alert("No se pudo iniciar sesión con Google.");
      }
    },
    auto_select: false,
    ux_mode: "popup" // o "redirect"
  });

  // Renderizar botón
  const btn = el("div", { id: "google-btn" });
  container.appendChild(btn);

  window.google.accounts.id.renderButton(btn, {
    theme: "outline",
    size: "large",
    shape: "pill",
    text: "continue_with"
  });
}

function renderDevFallback(container) {
  // ===== Fallback para DEV: login simulado por rol =====
  const roles = [ROLES_CONST.ADMIN, ROLES_CONST.ACTION, ROLES_CONST.READONLY];
  const box = el("div", { class: "card" },
    el("h3", {}, "Login simulado (DEV)"),
    el("div", {},
      el("label", {}, "Rol: "),
      (() => {
        const sel = el("select", {});
        roles.forEach(r => sel.appendChild(el("option", { value: r }, r)));
        return sel;
      })(),
      el("div", { style: "margin-top:.5rem" },
        el("button", {
          class: "btn",
          onClick: (e) => {
            const role = e.target.parentElement.previousSibling.value;
            const user = { email: "demo@local", name: "Demo" };
            // No hay token real en fallback; sólo ajustar estado
            setState({ user, role });
            location.hash = "#/dashboard";
          }
        }, "Entrar (DEV)")
      )
    )
  );
  container.appendChild(box);
}

export async function render() {
  const root = el("div", { class: "container" },
    el("div", { class: "card" },
      el("h2", {}, "Ingresar"),
      el("p", { class: "muted" }, "Usá tu cuenta de Google para acceder. Requiere HTTPS en producción.")
    )
  );

  // Contenedor para GIS
  await initGoogle(root);

  // Fallback DEV
  renderDevFallback(root);

  return root;
}
