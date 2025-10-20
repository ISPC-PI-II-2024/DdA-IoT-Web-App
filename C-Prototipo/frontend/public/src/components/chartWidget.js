// ==========================
// Chart Widget (vanilla canvas)
// - Dibuja últimos N puntos de un tópico RT
// - Optimiza con requestAnimationFrame
// ==========================

import { el } from "../utils/dom.js";
import { rtClient } from "../ws.js";
import { mqttTopicsService } from "../utils/mqttTopicsService.js";

export async function chartWidget({ 
  title = "Tiempo real", 
  topic = "metrics/demo", 
  maxPoints = 120,
  topicType = null // Tipo específico de tópico a usar
} = {}) {
  const root = el("div", { class: "card" },
    el("h3", {}, title),
    el("canvas", { width: 900, height: 240, style: "max-width:100%;height:auto;border:1px solid #242b36;border-radius:8px" })
  );
  const canvas = root.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  const data = []; // buffer circular sencillo
  let dirty = false;

  function pushPoint(v) {
    if (data.length >= maxPoints) data.shift();
    data.push(v);
    dirty = true;
  }

  // Render simple
  function draw() {
    if (!dirty) return;
    dirty = false;

    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // eje base
    ctx.strokeStyle = "#2b3341";
    ctx.beginPath();
    ctx.moveTo(0, H - 20);
    ctx.lineTo(W, H - 20);
    ctx.stroke();

    if (data.length < 2) return;

    // escala
    const min = Math.min(...data);
    const max = Math.max(...data);
    const pad = (max - min) * 0.1 || 10;
    const ymin = Math.floor(min - pad);
    const ymax = Math.ceil(max + pad);

    // path
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#46a0ff";
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (maxPoints - 1)) * (W - 20) + 10;
      const y = H - 20 - ((v - ymin) / (ymax - ymin)) * (H - 40);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // etiqueta min/max
    ctx.fillStyle = "#9aa4b2";
    ctx.font = "12px system-ui";
    ctx.fillText(`min: ${ymin.toFixed(1)}  max: ${ymax.toFixed(1)}`, 10, 14);
  }

  // RAF loop (ligero)
  function loop() {
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Suscripción al tópico
  let unsubscribe = null;
  let currentTopic = topic;
  
  const setupTopicSubscription = async () => {
    try {
      // Si se especifica un tipo de tópico, buscar tópicos de ese tipo
      if (topicType) {
        const topicsByType = mqttTopicsService.getTopicsByType(topicType);
        if (topicsByType.length > 0) {
          currentTopic = topicsByType[0].nombre;
          console.log(`📡 Usando tópico de tipo '${topicType}': ${currentTopic}`);
        }
      }
      
      // Suscribirse al tópico
      unsubscribe = rtClient.subscribe(currentTopic, (msg) => {
        const val = Number(msg?.payload?.value);
        if (!Number.isFinite(val)) return;
        pushPoint(val);
      });
      
      // Actualizar título con el tópico usado
      const titleElement = root.querySelector("h3");
      if (titleElement) {
        titleElement.textContent = `${title} (${currentTopic})`;
      }
      
    } catch (error) {
      console.error("Error configurando suscripción:", error);
      // Fallback a suscripción básica
      unsubscribe = rtClient.subscribe(topic, (msg) => {
        const val = Number(msg?.payload?.value);
        if (!Number.isFinite(val)) return;
        pushPoint(val);
      });
    }
  };
  
  // Configurar suscripción
  await setupTopicSubscription();

  // Limpieza si el nodo sale del DOM
  const observer = new MutationObserver(() => {
    if (!document.body.contains(root)) {
      if (unsubscribe) unsubscribe();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return root;
}
