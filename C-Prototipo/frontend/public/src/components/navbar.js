// ==========================
// Navbar basado en rol
// - Links visibles según permisos
// - Slot derecho: usuario + logout (cuando hay sesión)
// ==========================
import { el } from "../utils/dom.js";
import { getState, subscribe, logout, ROLES_CONST } from "../state/store.js";

function navLink(hash, label) {
  return el("a", { href: `#/${hash}`, "data-nav": hash }, label);
}

function buildLeft(role) {
  const box = el("nav", {});
  // Público
  box.appendChild(navLink("dashboard", "Dashboard"));
  box.appendChild(navLink("sobre-nosotros", "Sobre Nosotros"));

  // Admin-only (ejemplo futuro: /admin-tools)
  if (role === ROLES_CONST.ADMIN) {
    // box.appendChild(navLink("admin-tools", "Admin"));
  }
  return box;
}

function buildRight(user, role) {
  const r = el("div", { class: "right" });
  r.appendChild(el("span", { class: "badge" }, role));
  if (user) {
    r.appendChild(el("span", { class: "muted" }, user.name || user.email));
    r.appendChild(el("button", { class: "btn", onClick: () => { logout(); location.hash = "#/login"; } }, "Salir"));
  } else {
    r.appendChild(el("a", { href: "#/login" }, "Ingresar"));
  }
  return r;
}

export function renderNavbar() {
  const root = document.getElementById("navbar-root");

  const draw = () => {
    const { user, role } = getState();
    const bar = el("div", { class: "navbar" },
      el("div", { class: "brand" }, "C-Prototipo"),
      buildLeft(role),
      buildRight(user, role)
    );
    root.innerHTML = "";
    root.appendChild(bar);
  };

  draw();
  return subscribe(draw);
}
