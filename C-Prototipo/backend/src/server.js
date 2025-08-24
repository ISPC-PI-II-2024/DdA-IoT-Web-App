// ==========================
// Servidor Express base
// - CORS, JSON, Helmet
// - Rutas /api/auth
// - /health
// ==========================
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import { security } from "./config/security.js";

import authRoutes from "./routes/auth.routes.js";

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

// Arranque
app.listen(ENV.PORT, () => {
  console.log(`API listening on http://localhost:${ENV.PORT} [env=${ENV.NODE_ENV}]`);
});

