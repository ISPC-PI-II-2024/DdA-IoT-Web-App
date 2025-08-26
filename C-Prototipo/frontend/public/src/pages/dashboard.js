import { el } from "../utils/dom.js";
import { getState } from "../state/store.js";
import { chartWidget } from "../components/chartWidget.js";
import { rtClient } from "../ws.js";

export async function render() {
  const { role, currentProject } = getState();

  // Asegurar conexión WS (si aún no conectó)
  if (!rtClient.ws) {
    try { await rtClient.connect(); } catch (e) { console.error("WS connect:", e); }
  }

  const header = el("div", { class: "card" },
    el("h2", {}, "Panel de dispositivos IoT"),
    el("p", { class: "muted" }, `Proyecto actual: ${currentProject ?? "—"}`)
  );

  const rtChart = await chartWidget({ title: "Métrica RT (metrics/demo)", topic: "metrics/demo" });

  const grids = el("div", { class: "grid cols-2" },
    el("div", { class: "card" },
      el("h3", {}, "Estado general"),
      el("ul", {},
        el("li", {}, "Dispositivos online: 0"),
        el("li", {}, "Alertas activas: 0"),
        el("li", {}, "Última ingesta: —")
      )
    ),
    rtChart
  );

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
