// ==========================
// Dashboard
// - Vista común: admin/action/readonly
// - Muestra grids y stub de gráfico
// ==========================
import { el } from "../utils/dom.js";
import { getState } from "../state/store.js";
import { chartWidget } from "../components/chartWidget.js";

export async function render() {
  const { role, currentProject } = getState();

  const header = el("div", { class: "card" },
    el("h2", {}, "Panel de dispositivos IoT"),
    el("p", { class: "muted" }, `Proyecto actual: ${currentProject ?? "—"}`),
  );

  const grids = el("div", { class: "grid cols-2" },
    el("div", { class: "card" },
      el("h3", {}, "Estado general"),
      el("ul", {},
        el("li", {}, "Dispositivos online: 0"),
        el("li", {}, "Alertas activas: 0"),
        el("li", {}, "Última ingesta: —")
      )
    ),
    await chartWidget({ title: "Métrica RT (próximo paso)" })
  );

  // Secciones que podrían depender de rol:
  const actions = el("div", { class: "card" },
    el("h3", {}, "Acciones"),
    el("p", { class: "muted" }, "Acciones sobre dispositivos (solo admin/action)."),
    el("div", {},
      role === "readonly"
        ? el("div", { class: "muted" }, "Solo lectura: no hay acciones disponibles.")
        : el("button", { class: "btn" }, "Ejecutar acción (stub)")
    )
  );

  return el("div", {}, header, grids, actions);
}
