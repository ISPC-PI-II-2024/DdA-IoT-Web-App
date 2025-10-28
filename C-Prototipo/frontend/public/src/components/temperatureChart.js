// ==========================
// Temperature Chart Widget para datos MQTT
// - Muestra gráfico de temperatura en tiempo real
// - Conecta con WebSocket para datos MQTT
// - Incluye estadísticas básicas
// ==========================

import { el } from "../utils/dom.js";
import { rtClient } from "../ws.js";
import { mqttTopicsService } from "../utils/mqttTopicsService.js";
import { configService } from "../utils/configService.js";

export async function temperatureChartWidget({ 
  title = "Temperatura MQTT", 
  maxPoints = null,
  showStats = true,
  topicName = null // Si se especifica, usa este tópico específico
} = {}) {
  // Leer configuración de visualización
  const config = configService.getVisualizationConfig();
  
  // Usar configuración o valor por defecto
  const finalMaxPoints = maxPoints || config.chartPoints || 60;
  const temperatureUnit = config.temperatureUnit || "celsius";
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

  // seriesMap mantiene series independientes por línea:
  // key: `${sensorId}:temp` o `${sensorId}:hum`
  // value: Array<{ timestamp: string, value: number }>
  const seriesMap = new Map();
  const sensorIds = new Set();
  let dirty = false;

  // Paleta de colores para líneas (rotación determinística por clave)
  const COLORS = [
    "#46a0ff", "#4CAF50", "#FF5722", "#9C27B0", "#FFC107",
    "#00BCD4", "#E91E63", "#8BC34A", "#FF9800", "#3F51B5"
  ];

  function colorForKey(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % COLORS.length;
    return COLORS[idx];
  }

  // Función para convertir temperatura según unidad configurada
  function convertTemperature(temp, fromUnit, toUnit) {
    if (fromUnit === toUnit) return temp;
    if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
      return (temp * 9/5) + 32;
    }
    if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
      return (temp - 32) * 5/9;
    }
    return temp;
  }

  // Función para formatear temperatura con unidad
  function formatTemperature(temp) {
    const converted = convertTemperature(temp, 'celsius', temperatureUnit);
    const symbol = temperatureUnit === 'fahrenheit' ? '°F' : '°C';
    return converted.toFixed(1) + symbol;
  }

  function pushPoint(point) {
    const sid = point.sensor_id || "unknown";
    sensorIds.add(sid);
    if (typeof point.temperature === "number" && !isNaN(point.temperature)) {
      const keyT = `${sid}:temp`;
      if (!seriesMap.has(keyT)) seriesMap.set(keyT, []);
      const arrT = seriesMap.get(keyT);
      if (arrT.length >= finalMaxPoints) arrT.shift();
      arrT.push({ timestamp: point.timestamp, value: point.temperature });
    }
    if (typeof point.humidity === "number" && !isNaN(point.humidity)) {
      const keyH = `${sid}:hum`;
      if (!seriesMap.has(keyH)) seriesMap.set(keyH, []);
      const arrH = seriesMap.get(keyH);
      if (arrH.length >= finalMaxPoints) arrH.shift();
      arrH.push({ timestamp: point.timestamp, value: point.humidity });
    }
    dirty = true;
    updateStats();
  }

  function updateStats() {
    if (!statsContainer) return;
    const sensors = Array.from(sensorIds);
    if (sensors.length === 0) return;
    const items = sensors.map(sid => {
      const tArr = seriesMap.get(`${sid}:temp`) || [];
      const hArr = seriesMap.get(`${sid}:hum`) || [];
      const latestT = tArr.length ? tArr[tArr.length - 1].value : null;
      const latestH = hArr.length ? hArr[hArr.length - 1].value : null;
      const colorT = colorForKey(`${sid}:temp`);
      const colorH = colorForKey(`${sid}:hum`);
      return `
        <div class="stat-item" style="background:#2a3f5f;padding:0.5rem;border-radius:4px;min-width:120px;">
          <div style="font-size:0.75rem;color:#9aa4b2;">Sensor ${sid}</div>
          <div style="display:flex;gap:8px;align-items:center;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colorT}"></span>
            <span style="font-size:1rem;font-weight:bold;color:${colorT};">${latestT !== null ? formatTemperature(latestT) : '—'}</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;margin-top:4px;">
            <span style="display:inline-block;width:8px;height:2px;background:${colorH}"></span>
            <span style="font-size:0.95rem;font-weight:bold;color:${colorH};">${latestH !== null ? `${latestH.toFixed(1)}%` : '—'}</span>
          </div>
        </div>`;
    }).join("");
    statsContainer.innerHTML = items;
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

    // Determinar cantidad total de puntos (máximo de cualquier serie)
    const allSeries = Array.from(seriesMap.values());
    const totalPoints = allSeries.reduce((m, arr) => Math.max(m, arr.length), 0);
    if (totalPoints < 2) {
      // Mostrar mensaje de espera
      ctx.fillStyle = "#9aa4b2";
      ctx.font = "16px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Esperando datos de temperatura...", W / 2, H / 2);
      ctx.textAlign = "left";
      return;
    }

    // Escala de temperatura (todas las series de temp)
    const tempValues = [];
    seriesMap.forEach((arr, key) => {
      if (key.endsWith(":temp")) arr.forEach(p => { if (!isNaN(p.value)) tempValues.push(p.value); });
    });
    const tMin = tempValues.length ? Math.min(...tempValues) : 0;
    const tMax = tempValues.length ? Math.max(...tempValues) : 1;
    const tPad = (tMax - tMin) * 0.1 || 5;
    const tYMin = Math.floor(tMin - tPad);
    const tYMax = Math.ceil(tMax + tPad);

    // Escala de humedad (todas las series de hum)
    const humValues = [];
    seriesMap.forEach((arr, key) => {
      if (key.endsWith(":hum")) arr.forEach(p => { if (!isNaN(p.value)) humValues.push(p.value); });
    });
    const hMin = humValues.length ? Math.min(...humValues) : 0;
    const hMax = humValues.length ? Math.max(...humValues) : 100;
    const hPad = (hMax - hMin) * 0.1 || 5;
    const hYMin = Math.floor(hMin - hPad);
    const hYMax = Math.ceil(hMax + hPad);

    // Dibujar todas las líneas de temperatura (una por sensor)
    seriesMap.forEach((arr, key) => {
      if (!key.endsWith(":temp")) return;
      const color = colorForKey(key);
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.beginPath();
      arr.forEach((p, i) => {
        const x = (i / (finalMaxPoints - 1)) * (W - 40) + 20;
        const y = H - 20 - ((p.value - tYMin) / (tYMax - tYMin)) * (H - 40);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    // Puntos (temperatura)
    seriesMap.forEach((arr, key) => {
      if (!key.endsWith(":temp")) return;
      const color = colorForKey(key);
      ctx.fillStyle = color;
      arr.forEach((p, i) => {
        const x = (i / (finalMaxPoints - 1)) * (W - 40) + 20;
        const y = H - 20 - ((p.value - tYMin) / (tYMax - tYMin)) * (H - 40);
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // Etiquetas de escala temperatura (izquierda)
    ctx.fillStyle = "#9aa4b2";
    ctx.font = "12px system-ui";
    ctx.textAlign = "left";
    ctx.fillText(`${formatTemperature(tYMin)}`, 5, H - 15);
    ctx.fillText(`${formatTemperature(tYMax)}`, 5, 25);

    // Dibujar todas las líneas de humedad (una por sensor) - con línea discontinua
    seriesMap.forEach((arr, key) => {
      if (!key.endsWith(":hum")) return;
      const color = colorForKey(key);
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      arr.forEach((p, i) => {
        const x = (i / (finalMaxPoints - 1)) * (W - 40) + 20;
        const y = H - 20 - ((p.value - hYMin) / (hYMax - hYMin)) * (H - 40);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Eje derecho para humedad (valores extremos)
    ctx.fillStyle = "#9aa4b2";
    ctx.font = "12px system-ui";
    ctx.textAlign = "right";
    ctx.fillText(`${hYMin}%`, W - 5, H - 15);
    ctx.fillText(`${hYMax}%`, W - 5, 25);

    // Leyenda
    let legendY = 15;
    ctx.font = "12px system-ui";
    ctx.textAlign = "left";
    sensorIds.forEach(sid => {
      const keyT = `${sid}:temp`;
      const keyH = `${sid}:hum`;
      const cT = colorForKey(keyT);
      const cH = colorForKey(keyH);
      // temp legend
      ctx.fillStyle = cT;
      ctx.fillRect(W - 180, legendY - 6, 18, 3);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`Temp Sensor ${sid}`, W - 155, legendY);
      legendY += 16;
      // humidity legend
      ctx.fillStyle = cH;
      ctx.fillRect(W - 180, legendY - 6, 18, 3);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`Hum Sensor ${sid}`, W - 155, legendY);
      legendY += 16;
    });
  }

  // RAF loop
  function loop() {
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Suscripción a datos de temperatura desde MQTT
  let unsubscribe = null;
  let currentTopic = null;
  
  const setupTopicSubscription = async () => {
    try {
      // Obtener tópicos de temperatura disponibles
      const temperatureTopics = mqttTopicsService.getTemperatureTopics();
      
      // Determinar qué tópico usar
      if (topicName) {
        // Usar tópico específico si se proporciona
        currentTopic = topicName;
      } else if (temperatureTopics.length > 0) {
        // Usar el primer tópico de temperatura disponible
        currentTopic = temperatureTopics[0].nombre;
      } else {
        // Fallback al tópico por defecto
        currentTopic = "temperature";
      }
      
      console.log(`[WS] Suscribiendose a topico de temperatura: ${currentTopic}`);
      
      // Suscribirse al tópico específico
      unsubscribe = rtClient.subscribe(currentTopic, (msg) => {
        if (msg.type === "temperature_update" && msg.data) {
          pushPoint(msg.data);
        } else if (msg.payload && typeof msg.payload.value === 'number') {
          // Formato alternativo de datos
          pushPoint({
            timestamp: new Date().toISOString(),
            temperature: msg.payload.value,
            topic: currentTopic
          });
        }
      });
      
      // Actualizar título con el tópico usado
      const titleElement = root.querySelector("h3");
      if (titleElement) {
        titleElement.textContent = `${title} (${currentTopic})`;
      }
      
    } catch (error) {
      console.error("Error configurando suscripción a tópico:", error);
      // Fallback a suscripción básica
      unsubscribe = rtClient.subscribe("temperature", (msg) => {
        if (msg.type === "temperature_update" && msg.data) {
          pushPoint(msg.data);
        }
      });
    }
  };
  
  // Configurar suscripción
  await setupTopicSubscription();

  // Cargar datos históricos iniciales
  try {
    const response = await fetch(`${window.__CONFIG?.API_URL || '/api'}/temperature?limit=${finalMaxPoints}`);
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
