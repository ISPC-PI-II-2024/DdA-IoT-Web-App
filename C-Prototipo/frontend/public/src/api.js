// ==========================
// Wrapper de fetch + helpers de Auth
// ==========================
import { storage } from "./utils/storage.js";
import { setState, ROLES_CONST } from "./state/store.js";

const CFG = () => window.__CONFIG || {};
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const ROLE_KEY = "auth_role";

export function getToken() {
  return storage.get(TOKEN_KEY);
}
export function setSession({ accessToken, user, role }) {
  storage.set(TOKEN_KEY, accessToken, true); // sessionStorage
  storage.set(USER_KEY, user, true);
  storage.set(ROLE_KEY, role, true);
  setState({ user, role });
}
export function clearSession() {
  storage.del(TOKEN_KEY, true);
  storage.del(USER_KEY, true);
  storage.del(ROLE_KEY, true);
  // También limpiar localStorage por seguridad
  storage.del(TOKEN_KEY, false);
  storage.del(USER_KEY, false);
  storage.del(ROLE_KEY, false);
  setState({ user: null, role: ROLES_CONST.GUEST, currentProject: null });
}

// Inicializar sesión desde storage al cargar la app
export async function initSession() {
  const token = getToken();
  const storedUser = storage.get(USER_KEY, null, true);
  const storedRole = storage.get(ROLE_KEY, null, true);
  
  if (token && storedUser && storedRole) {
    try {
      // Verificar que el token sigue siendo válido consultando algún endpoint
      // Por simplicidad, intentamos hacer una request autenticada
      await request("/config/general", { auth: true });
      // Si no lanza error, el token es válido, restaurar sesión
      setSession({ accessToken: token, user: storedUser, role: storedRole });
      return true;
    } catch (error) {
      // Token inválido, limpiar sesión
      clearSession();
      return false;
    }
  }
  return false;
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(`${CFG().API_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error("API error"), { status: res.status, data });
  return data;
}

// === Endpoints ===
export const AuthAPI = {
  googleLogin(credential) {
    return request("/auth/google", { method: "POST", body: { credential } });
  }
};

export const ConfigAPI = {
  // Configuración general - todos los autenticados
  getGeneralConfig() {
    return request("/config/general", { auth: true });
  },
  
  // Configuración avanzada - solo admin
  getAdvancedConfig() {
    return request("/config/advanced", { auth: true });
  },
  
  updateAdvancedConfig(config) {
    return request("/config/advanced", { method: "PUT", body: { config }, auth: true });
  },
  
  // Administración
  getMQTTStatus() {
    return request("/config/mqtt/status", { auth: true });
  },
  
  getMQTTTopics() {
    return request("/config/mqtt/topics", { auth: true });
  },
  
  restartMQTTConnection() {
    return request("/config/mqtt/restart", { method: "POST", auth: true });
  },
  
  reloadMQTTTopics() {
    return request("/config/mqtt/reload-topics", { method: "POST", auth: true });
  },
  
  clearDataCache() {
    return request("/config/cache/clear", { method: "POST", auth: true });
  },

  // CRUD de tópicos MQTT (solo admin)
  createMQTTTopic(topicData) {
    return request("/config/mqtt/topics", { method: "POST", body: topicData, auth: true });
  },

  updateMQTTTopic(topicId, topicData) {
    return request(`/config/mqtt/topics/${topicId}`, { method: "PUT", body: topicData, auth: true });
  },

  deleteMQTTTopic(topicId) {
    return request(`/config/mqtt/topics/${topicId}`, { method: "DELETE", auth: true });
  }
};

export const DevicesAPI = {
  // Obtener todos los dispositivos disponibles
  getAllDevices() {
    return request("/devices", { auth: true });
  },
  
  // Obtener información detallada de un dispositivo específico
  getDeviceById(deviceId) {
    return request(`/devices/${deviceId}`, { auth: true });
  },
  
  // Obtener datos de sensores de un dispositivo específico
  getDeviceSensorData(deviceId, limit = 100) {
    return request(`/devices/${deviceId}/sensor-data?limit=${limit}`, { auth: true });
  }
};