// ==========================
// Página pública
// ==========================
import { el } from "../utils/dom.js";

export async function render() {
  return el("div", { class: "container" },
    el("div", { class: "card" },
      el("h2", {}, "Sobre C-Prototipo"),
      el("p", {}, "Web modular para administración y visualización de proyectos IoT."),
      el("p", { class: "muted" }, "Robusto en vanilla JS, integrable con OAuth, WebSockets y PWA.")
    )
  );
}
