// ==========================
// Temperature Chart Widget para datos MQTT
// - Muestra gráfico de temperatura en tiempo real
// - Conecta con WebSocket para datos MQTT
// - Incluye estadísticas básicas
// ==========================

import { el } from "../utils/dom.js";
import { rtClient } from "../ws.js";

export async function temperatureChartWidget({ 
  title = "Temperatura MQTT", 
  maxPoints = 60,
  showStats = true 
} = {}) {
  const root = el("div", { class: "card" },
    el("h3", {}, title),
    el("div", { class: "chart-container" },
      el("canvas", { 
        width: 900, 
        height: 300, 
        style: "max-width:100%;height:auto;border:1px solid #242b36;border-radius:8px;background:#1a1f2e;" 
      })
    )
  );

  if (showStats) {
    const statsContainer = el("div", { 
      class: "stats-container",
      style: "display:flex;gap:1rem;margin-top:1rem;flex-wrap:wrap;"
    });
    root.appendChild(statsContainer);
  }

  const canvas = root.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const statsContainer = root.querySelector(".stats-container");

  const data = []; // buffer circular
  let dirty = false;
  let stats = { count: 0, avg: 0, min: 0, max: 0, latest: 0 };

  function pushPoint(point) {
    if (data.length >= maxPoints) data.shift();
    data.push(point);
    dirty = true;
    updateStats();
  }

  function updateStats() {
    if (data.length === 0) return;
    
    const temps = data.map(d => d.temperature).filter(t => !isNaN(t));
    if (temps.length === 0) return;

    stats = {
      count: data.length,
      avg: temps.reduce((a, b) => a + b, 0) / temps.length,
      min: Math.min(...temps),
      max: Math.max(...temps),
      latest: data[data.length - 1]?.temperature || 0
    };

    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-item" style="background:#2a3f5f;padding:0.5rem;border-radius:4px;min-width:80px;">
          <div style="font-size:0.8rem;color:#9aa4b2;">Última</div>
          <div style="font-size:1.2rem;font-weight:bold;color:#46a0ff;">${stats.latest.toFixed(1)}°C</div>
        </div>
        <div class="stat-item" style="background:#2a3f5f;padding:0.5rem;border-radius:4px;min-width:80px;">
          <div style="font-size:0.8rem;color:#9aa4b2;">Promedio</div>
          <div style="font-size:1.2rem;font-weight:bold;color:#46a0ff;">${stats.avg.toFixed(1)}°C</div>
        </div>
        <div class="stat-item" style="background:#2a3f5f;padding:0.5rem;border-radius:4px;min-width:80px;">
          <div style="font-size:0.8rem;color:#9aa4b2;">Mín</div>
          <div style="font-size:1.2rem;font-weight:bold;color:#ff6b6b;">${stats.min.toFixed(1)}°C</div>
        </div>
        <div class="stat-item" style="background:#2a3f5f;padding:0.5rem;border-radius:4px;min-width:80px;">
          <div style="font-size:0.8rem;color:#9aa4b2;">Máx</div>
          <div style="font-size:1.2rem;font-weight:bold;color:#ff6b6b;">${stats.max.toFixed(1)}°C</div>
        </div>
        <div class="stat-item" style="background:#2a3f5f;padding:0.5rem;border-radius:4px;min-width:80px;">
          <div style="font-size:0.8rem;color:#9aa4b2;">Puntos</div>
          <div style="font-size:1.2rem;font-weight:bold;color:#9aa4b2;">${stats.count}</div>
        </div>
      `;
    }
  }

  function draw() {
    if (!dirty) return;
    dirty = false;

    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Fondo con grid sutil
    ctx.strokeStyle = "#2b3341";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (H - 40) * (i / 4) + 20;
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(W - 20, y);
      ctx.stroke();
    }

    if (data.length < 2) {
      // Mostrar mensaje de espera
      ctx.fillStyle = "#9aa4b2";
      ctx.font = "16px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Esperando datos de temperatura...", W / 2, H / 2);
      ctx.textAlign = "left";
      return;
    }

    // Escala de temperatura
    const temps = data.map(d => d.temperature).filter(t => !isNaN(t));
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const pad = (max - min) * 0.1 || 5;
    const ymin = Math.floor(min - pad);
    const ymax = Math.ceil(max + pad);

    // Línea de temperatura
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#46a0ff";
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = (i / (maxPoints - 1)) * (W - 40) + 20;
      const y = H - 20 - ((point.temperature - ymin) / (ymax - ymin)) * (H - 40);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Puntos de datos
    ctx.fillStyle = "#46a0ff";
    data.forEach((point, i) => {
      const x = (i / (maxPoints - 1)) * (W - 40) + 20;
      const y = H - 20 - ((point.temperature - ymin) / (ymax - ymin)) * (H - 40);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Etiquetas de escala
    ctx.fillStyle = "#9aa4b2";
    ctx.font = "12px system-ui";
    ctx.textAlign = "left";
    ctx.fillText(`${ymin}°C`, 5, H - 15);
    ctx.fillText(`${ymax}°C`, 5, 25);
    
    // Último valor
    if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      const x = ((data.length - 1) / (maxPoints - 1)) * (W - 40) + 20;
      const y = H - 20 - ((lastPoint.temperature - ymin) / (ymax - ymin)) * (H - 40);
      
      ctx.fillStyle = "#46a0ff";
      ctx.font = "bold 14px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${lastPoint.temperature.toFixed(1)}°C`, x, y - 10);
      ctx.textAlign = "left";
    }

    // Timestamp del último dato
    if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      const timeStr = new Date(lastPoint.timestamp).toLocaleTimeString();
      ctx.fillStyle = "#6b7280";
      ctx.font = "10px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(`Último: ${timeStr}`, W - 10, H - 5);
      ctx.textAlign = "left";
    }
  }

  // RAF loop
  function loop() {
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Suscripción a datos de temperatura desde MQTT
  const unsubscribe = rtClient.subscribe("temperature", (msg) => {
    if (msg.type === "temperature_update" && msg.data) {
      pushPoint(msg.data);
    }
  });

  // Cargar datos históricos iniciales
  try {
    const response = await fetch(`${window.__CONFIG?.API_URL || '/api'}/temperature?limit=${maxPoints}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        result.data.forEach(point => pushPoint(point));
      }
    }
  } catch (error) {
    console.warn("No se pudieron cargar datos históricos:", error);
  }

  // Limpieza cuando el componente se remueve
  const observer = new MutationObserver(() => {
    if (!document.body.contains(root)) {
      unsubscribe();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return root;
}
