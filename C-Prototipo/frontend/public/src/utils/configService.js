// ==========================
// Servicio para manejo de configuración
// - Sincronización entre localStorage y API
// - Cache de configuración
// - Validaciones
// ==========================
import { ConfigAPI } from "../api.js";

const CONFIG_KEYS = {
  VISUALIZATION: "visualization_config",
  ADVANCED: "advanced_config",
  NOTIFICATIONS: "notification_config",
  USER_PREFERENCES: "user_preferences"
};

class ConfigService {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
  }

  // === Eventos ===
  onConfigChange(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    
    return () => {
      const set = this.listeners.get(key);
      if (set) {
        set.delete(callback);
      }
    };
  }

  emitChange(key, value) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error("Error en listener de configuración:", error);
        }
      });
    }
  }

  // === Operaciones básicas ===
  /* eslint-disable no-undef */
  get(key, fallback = null) {
    try {
      // Primero buscar en cache
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      // Luego buscar en localStorage
      const raw = localStorage.getItem(key);
      const config = raw ? JSON.parse(raw) : fallback;
      
      // Guardar en cache
      this.cache.set(key, config);
      return config;
    } catch (error) {
      console.error(`Error leyendo configuración ${key}:`, error);
      return fallback;
    }
  }

  set(key, value) {
    try {
      // Guardar en localStorage
      localStorage.setItem(key, JSON.stringify(value));
      
      // Actualizar cache
      this.cache.set(key, value);
      
      // Notificar cambios
      this.emitChange(key, value);
      
      return true;
    } catch (error) {
      console.error(`Error guardando configuración ${key}:`, error);
      return false;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(key);
      this.cache.delete(key);
      this.emitChange(key, null);
      return true;
    } catch (error) {
      console.error(`Error removiendo configuración ${key}:`, error);
      return false;
    }
  }

  // === Configuraciones específicas ===
  getVisualizationConfig() {
    return this.get(CONFIG_KEYS.VISUALIZATION, {
      temperatureUnit: "celsius",
      chartRefresh: 1000,
      chartPoints: 60
    });
  }

  setVisualizationConfig(config) {
    return this.set(CONFIG_KEYS.VISUALIZATION, config);
  }

  getAdvancedConfig() {
    return this.get(CONFIG_KEYS.ADVANCED, {
      thresholds: {
        tempMinNormal: 18.0,
        tempMaxNormal: 25.0,
        tempAlertaCalor: 30.0,
        tempAlertaFrio: 5.0,
        enableTempAlerts: true
      },
      charts: {
        updateInterval: 1000,
        dataPoints: 60,
        autoScale: true,
        realTime: true
      },
      mqtt: {
        topics: ["vittoriodurigutti/prueba", "vittoriodurigutti/temperature"],
        qosLevel: 1,
        timeout: 30000
      },
      notifications: {
        email: "",
        cooldown: 5,
        logging: false,
        debugMode: false
      }
    });
  }

  async setAdvancesConfig(config) {
    // Guardar localmente
    const localSuccess = this.set(CONFIG_KEYS.ADVANCED, config);
    
    // Si el usuario es admin, sincronizar con servidor
    try {
      await ConfigAPI.updateAdvancedConfig(config);
      console.log("Configuración avanzada sincronizada con servidor");
    } catch (error) {
      console.warn("No se pudo sincronizar configuración avanzada:", error);
      // La configuración local se mantiene aunque falle la sincronización
    }
    
    return localSuccess;
  }

  getNotificationConfig() {
    return this.get(CONFIG_KEYS.NOTIFICATIONS, {
      browserNotifications: false,
      soundAlerts: false
    });
  }

  setNotificationConfig(config) {
    return this.set(CONFIG_KEYS.NOTIFICATIONS, config);
  }

  // === Sincronización con servidor ===
  async loadFromServer(configType = "general") {
    try {
      let response;
      
      if (configType === "advanced") {
        response = await ConfigAPI.getAdvancedConfig();
      } else {
        response = await ConfigAPI.getGeneralConfig();
      }
      
      if (response.success) {
        return response.config;
      }
      
      throw new Error("Respuesta del servidor inválida");
    } catch (error) {
      console.error(`Error cargando configuración ${configType}:`, error);
      throw error;
    }
  }

  // === Utilidades ===
  exportConfig() {
    const exportData = {};
    
    // Exportar todas las configuraciones
    Object.values(CONFIG_KEYS).forEach(key => {
      exportData[key] = this.get(key);
    });
    
    exportData.metadata = {
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    };
    
    return exportData;
  }

  importConfig(configData) {
    try {
      // Validar estructura
      if (!this.validateConfigStructure(configData)) {
        throw new Error("Estructura de configuración inválida");
      }
      
      // Importar cada configuración
      Object.entries(configData).forEach(([key, value]) => {
        if (key !== "metadata" && value !== null) {
          this.set(key, value);
        }
      });
      
      console.log("Configuración importada exitosamente");
      return true;
    } catch (error) {
      console.error("Error importando configuración:", error);
      return false;
    }
  }

  validateConfigStructure(configData) {
    // Validación básica de estructura
    return configData && typeof configData === "object";
  }

  // === Reseteo ===
  resetAll() {
    Object.values(CONFIG_KEYS).forEach(key => {
      this.remove(key);
    });
    console.log("Toda la configuración ha sido reseteada");
  }

  resetConfig(key) {
    if (CONFIG_KEYS.hasOwnProperty(key)) {
      this.remove(CONFIG_KEYS[key]);
      return true;
    }
    return false;
  }

  // === Estado ===
  getStatus() {
    const status = {
      localStorage: typeof Storage !== "undefined",
      cacheSize: this.cache.size,
      listeners: this.listeners.size,
      configurations: {}
    };
    
    Object.entries(CONFIG_KEYS).forEach(([name, key]) => {
      status.configurations[name] = !!this.get(key);
    });
    
    return status;
  }
}

// Exportar instancia singleton
export const configService = new ConfigService();
export { CONFIG_KEYS };
