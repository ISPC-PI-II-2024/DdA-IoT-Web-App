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
  // Contenedor de navegación con clase esperada por el CSS
  const nav = el("nav", { class: "navbar-nav" });
  // Público
  nav.appendChild(navLink("dashboard", "Dashboard"));
  nav.appendChild(navLink("sobre-nosotros", "Sobre Nosotros"));

  // Admin-only (ejemplo futuro: /admin-tools)
  if (role === ROLES_CONST.ADMIN) {
    // nav.appendChild(navLink("admin-tools", "Admin"));
  }
  return nav;
}

function buildRight(user, role) {
  // Contenedor usuario, clase esperada por el CSS
  const userBox = el("div", { class: "navbar-user" });

  if (user) {
    userBox.appendChild(
      el("span", { class: "usuario" }, user.name || user.email)
    );
    userBox.appendChild(
      el(
        "button",
        {
          class: "btn-logout",
          onClick: () => {
            logout();
            location.hash = "#/login";
          },
        },
        "Salir"
      )
    );
  } else {
    userBox.appendChild(
      el(
        "button",
        {
          class: "btn-login",
          onClick: () => {
            location.hash = "#/login";
          },
        },
        "Ingresar"
      )
    );
  }
  return userBox;
}

export function renderNavbar() {
  const root = document.getElementById("navbar-root");

  const draw = () => {
    const { user, role } = getState();
    const bar = el(
      "div",
      { class: "navbar" },
      el("div", { class: "navbar-logo" }, "ISPC Desarrollo Aplicaciones"),
      buildLeft(role),
      buildRight(user, role)
    );
    root.innerHTML = "";
    root.appendChild(bar);
  };

  draw();
  return subscribe(draw);
}
