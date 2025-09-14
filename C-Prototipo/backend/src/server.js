// ====================================================================
// Servidor Express base + WebSocket en /ws
// - Tiene helmet, cors, morgan, /api, /health
// - Inicia HTTP server y llama initWebSocket(server)
// ====================================================================
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import { security } from "./config/security.js";
import { createServer } from "http";
import authRoutes from "./routes/auth.routes.js";
import configRoutes from "./routes/config.routes.js";
import dataRoutes from './routes/data.routes.js';
import temperatureRoutes from "./routes/temperature.routes.js";
import { initWebSocket } from "./sw/index.js";
import { mqttService } from "./service/mqtt.service.js";

const app = express();

// Middlewares base
security(app);
app.use(morgan(ENV.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(cors({
  origin: ENV.CORS_ORIGIN === "*" ? true : ENV.CORS_ORIGIN.split(","),
  credentials: true
}));

// Salud
app.get("/health", (req, res) => res.json({ ok: true }));

// API
app.use("/api/auth", authRoutes);
app.use("/api", configRoutes);
app.use("/api", temperatureRoutes);
app.use('/api', dataRoutes);

// HTTP server + WS
const server = createServer(app);
initWebSocket(server);

// Iniciar conexión MQTT
mqttService.connect();

// Arranque
server.listen(ENV.PORT, () => {
  console.log(`HTTP+WS listening on http://localhost:${ENV.PORT}  (ws path: /ws)`);
  console.log(`📡 MQTT broker: ${ENV.MQTT_BROKER_HOST}:${ENV.MQTT_BROKER_PORT}`);
  console.log(`📡 MQTT topics: ${ENV.MQTT_TOPICS.join(", ")}`);
});
