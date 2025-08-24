// ==========================
// Chart Widget (stub)
// - Interfaz preparada para enchufar lib de gráficos luego (uPlot/Chart.js)
// ==========================
import { el } from "../utils/dom.js";

export async function chartWidget({ title = "Tiempo real", series = [] } = {}) {
  const root = el("div", { class: "card" },
    el("h3", {}, title),
    el("div", { id: "chart-canvas", style: "height:240px" }, "Chart RT vendrá aquí (Paso 3)")
  );
  // Aquí luego inicializaremos uPlot/Chart.js y expondremos {update()}.
  return root;
}
