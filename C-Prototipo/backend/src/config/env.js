// ==========================
// Carga y validación de variables de entorno
// ==========================
import dotenv from "dotenv";
import path from "path";
import Joi from "joi";

// Cargar primero .env de la raíz del proyecto y darle prioridad
// Luego cargar (sin override) el .env local si existiera, pero sin pisar variables ya definidas
const rootEnvPath = path.resolve(process.cwd(), "../.env");
dotenv.config({ path: rootEnvPath, override: true });
dotenv.config({ override: false });

const schema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().integer().default(3000),

  // Modo de desarrollo
  DEV_MODE: Joi.string().valid("true", "false").default("false"),
  DEV_USER_EMAIL: Joi.string().email().default("dev@localhost.com"),
  DEV_USER_NAME: Joi.string().default("Desarrollador Local"),

  // Seguridad JWT propia
  JWT_SECRET: Joi.string().min(24).required(),
  JWT_EXPIRES_IN: Joi.string().default("15m"),
  REFRESH_EXPIRES_IN: Joi.string().default("7d"), // reservado para posibles cookies

  // Google Identity Services
  GOOGLE_CLIENT_ID: Joi.string().required(),

  // CORS
  CORS_ORIGIN: Joi.string().default("*"),

  // MQTT Configuration
  MQTT_BROKER_HOST: Joi.string().default("localhost"),
  MQTT_BROKER_PORT: Joi.number().integer().default(1883),
  MQTT_BROKER_USERNAME: Joi.string().allow("").default(""),
  MQTT_BROKER_PASSWORD: Joi.string().allow("").default(""),
  MQTT_TOPICS: Joi.string().default("vittoriodurigutti/prueba,vittoriodurigutti/temperature,vittoriodurigutti/sensor/+"),

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
  DEV_MODE: value.DEV_MODE,
  DEV_USER_EMAIL: value.DEV_USER_EMAIL,
  DEV_USER_NAME: value.DEV_USER_NAME,
  JWT_SECRET: value.JWT_SECRET,
  JWT_EXPIRES_IN: value.JWT_EXPIRES_IN,
  REFRESH_EXPIRES_IN: value.REFRESH_EXPIRES_IN,
  GOOGLE_CLIENT_ID: value.GOOGLE_CLIENT_ID,
  CORS_ORIGIN: value.CORS_ORIGIN,
  MQTT_BROKER_HOST: value.MQTT_BROKER_HOST,
  MQTT_BROKER_PORT: value.MQTT_BROKER_PORT,
  MQTT_BROKER_USERNAME: value.MQTT_BROKER_USERNAME,
  MQTT_BROKER_PASSWORD: value.MQTT_BROKER_PASSWORD,
  MQTT_TOPICS: parseList(value.MQTT_TOPICS),
  ADMIN_WHITELIST: parseList(value.ADMIN_WHITELIST),
  ACTION_WHITELIST: parseList(value.ACTION_WHITELIST)
};
