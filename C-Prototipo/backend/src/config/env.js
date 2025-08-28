// ==========================
// Carga y validación de variables de entorno
// ==========================
import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const schema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().integer().default(3000),

  // Seguridad JWT propia
  JWT_SECRET: Joi.string().min(24).required(),
  JWT_EXPIRES_IN: Joi.string().default("15m"),
  REFRESH_EXPIRES_IN: Joi.string().default("7d"), // reservado para posibles cookies

  // Google Identity Services
  GOOGLE_CLIENT_ID: Joi.string().required(),

  // CORS
  CORS_ORIGIN: Joi.string().default("*"),

  // Listas blancas para roles (en el env dentro de backend, coloquen su gmail personal)
  ADMIN_WHITELIST: Joi.string().allow("").default(""),
  ACTION_WHITELIST: Joi.string().allow("").default("")
}).unknown();

const { value, error } = schema.validate(process.env, { abortEarly: false });
if (error) {
  console.error("❌ ENV ERROR:", error.details.map(d => d.message).join("; "));
  process.exit(1);
}

function parseList(s) {
  return (s || "")
    .split(",")
    .map(x => x.trim().toLowerCase())
    .filter(Boolean);
}

export const ENV = {
  NODE_ENV: value.NODE_ENV,
  PORT: value.PORT,
  JWT_SECRET: value.JWT_SECRET,
  JWT_EXPIRES_IN: value.JWT_EXPIRES_IN,
  REFRESH_EXPIRES_IN: value.REFRESH_EXPIRES_IN,
  GOOGLE_CLIENT_ID: value.GOOGLE_CLIENT_ID,
  CORS_ORIGIN: value.CORS_ORIGIN,
  ADMIN_WHITELIST: parseList(value.ADMIN_WHITELIST),
  ACTION_WHITELIST: parseList(value.ACTION_WHITELIST)
};
