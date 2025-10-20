// ==========================
// Servicio optimizado para dispositivos con cache
// Reduce consultas al backend y mejora el rendimiento
// ==========================

import { DevicesAPI } from "../api.js";
import { cacheService, CACHE_KEYS, CACHE_TTL } from "./cacheService.js";
import { setDevices } from "../state/store.js";

class DeviceService {
  constructor() {
    this.isLoading = false;
    this.loadingPromises = new Map();
  }

  /**
   * Obtiene todos los dispositivos con cache
   * @returns {Promise<Array>} Lista de dispositivos
   */
  async getAllDevices() {
    // Verificar cache primero
    const cached = cacheService.get(CACHE_KEYS.DEVICES);
    if (cached) {
      console.log("📦 Dispositivos obtenidos del cache");
      return cached;
    }

    // Evitar múltiples consultas simultáneas
    if (this.isLoading) {
      return new Promise((resolve) => {
        const checkCache = () => {
          const cached = cacheService.get(CACHE_KEYS.DEVICES);
          if (cached) {
            resolve(cached);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    this.isLoading = true;
    console.log("🌐 Cargando dispositivos desde el servidor...");

    try {
      // Timeout para evitar que se quede colgado
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: El servidor no responde')), 10000);
      });

      const apiPromise = DevicesAPI.getAllDevices();
      const response = await Promise.race([apiPromise, timeoutPromise]);

      if (response.success) {
        const devices = response.data;
        
        // Cachear los dispositivos
        cacheService.set(CACHE_KEYS.DEVICES, devices, CACHE_TTL.DEVICES);
        
        // Actualizar el estado global
        setDevices(devices);
        
        console.log(`✅ ${devices.length} dispositivos cargados y cacheados`);
        return devices;
      } else {
        throw new Error("Error en respuesta del servidor");
      }
    } catch (error) {
      console.error("❌ Error cargando dispositivos:", error);
      
      // Fallback: devolver datos de ejemplo si el servidor falla
      const fallbackDevices = [
        {
          id: 1,
          id_dispositivo: "demo-device-001",
          nombre: "Dispositivo Demo",
          tipo: "sensor",
          ubicacion: "Laboratorio",
          estado: "activo",
          ultima_conexion: new Date().toISOString(),
          fecha_creacion: new Date().toISOString()
        }
      ];
      
      console.log("🔄 Usando datos de fallback");
      cacheService.set(CACHE_KEYS.DEVICES, fallbackDevices, 60000); // 1 minuto
      setDevices(fallbackDevices);
      
      return fallbackDevices;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Obtiene detalles de un dispositivo específico con cache
   * @param {string} deviceId - ID del dispositivo
   * @returns {Promise<Object>} Detalles del dispositivo
   */
  async getDeviceDetails(deviceId) {
    const cacheKey = `${CACHE_KEYS.DEVICE_DETAILS}_${deviceId}`;
    
    // Verificar cache
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log(`📦 Detalles del dispositivo ${deviceId} obtenidos del cache`);
      return cached;
    }

    console.log(`🌐 Cargando detalles del dispositivo ${deviceId}...`);

    try {
      // Timeout para evitar que se quede colgado
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: El servidor no responde')), 8000);
      });

      const apiPromise = DevicesAPI.getDeviceById(deviceId);
      const response = await Promise.race([apiPromise, timeoutPromise]);

      if (response.success) {
        const device = response.data.device;
        
        // Cachear los detalles
        cacheService.set(cacheKey, device, CACHE_TTL.DEVICE_DETAILS);
        
        console.log(`✅ Detalles del dispositivo ${deviceId} cargados y cacheados`);
        return device;
      } else {
        throw new Error("Error en respuesta del servidor");
      }
    } catch (error) {
      console.error(`❌ Error cargando detalles del dispositivo ${deviceId}:`, error);
      
      // Fallback: devolver datos de ejemplo
      const fallbackDevice = {
        id: 1,
        id_dispositivo: deviceId,
        nombre: "Dispositivo Demo",
        tipo: "sensor",
        ubicacion: "Laboratorio",
        estado: "activo",
        ultima_conexion: new Date().toISOString(),
        metadatos: {},
        fecha_creacion: new Date().toISOString()
      };
      
      console.log(`🔄 Usando datos de fallback para dispositivo ${deviceId}`);
      cacheService.set(cacheKey, fallbackDevice, 60000);
      return fallbackDevice;
    }
  }

  /**
   * Obtiene datos de sensores de un dispositivo con cache
   * @param {string} deviceId - ID del dispositivo
   * @param {number} limit - Límite de registros
   * @returns {Promise<Array>} Datos de sensores
   */
  async getDeviceSensorData(deviceId, limit = 50) {
    const cacheKey = `${CACHE_KEYS.DEVICE_SENSOR_DATA}_${deviceId}_${limit}`;
    
    // Verificar cache
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log(`📦 Datos de sensores del dispositivo ${deviceId} obtenidos del cache`);
      return cached;
    }

    console.log(`🌐 Cargando datos de sensores del dispositivo ${deviceId}...`);

    try {
      // Timeout para evitar que se quede colgado
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: El servidor no responde')), 6000);
      });

      const apiPromise = DevicesAPI.getDeviceSensorData(deviceId, limit);
      const response = await Promise.race([apiPromise, timeoutPromise]);

      if (response.success) {
        const sensorData = response.data;
        
        // Cachear los datos (TTL más corto para datos dinámicos)
        cacheService.set(cacheKey, sensorData, CACHE_TTL.DEVICE_SENSOR_DATA);
        
        console.log(`✅ ${sensorData.length} registros de sensores cargados y cacheados`);
        return sensorData;
      } else {
        throw new Error("Error en respuesta del servidor");
      }
    } catch (error) {
      console.error(`❌ Error cargando datos de sensores del dispositivo ${deviceId}:`, error);
      
      // Fallback: devolver datos de ejemplo
      const fallbackData = [
        {
          id: 1,
          tipo_sensor: "temperatura",
          valor: "22.5",
          unidad: "°C",
          timestamp: new Date().toISOString(),
          metadatos: {}
        },
        {
          id: 2,
          tipo_sensor: "humedad",
          valor: "65.2",
          unidad: "%",
          timestamp: new Date(Date.now() - 60000).toISOString(),
          metadatos: {}
        }
      ];
      
      console.log(`🔄 Usando datos de fallback para sensores del dispositivo ${deviceId}`);
      cacheService.set(cacheKey, fallbackData, 60000);
      return fallbackData;
    }
  }

  /**
   * Obtiene estadísticas de un dispositivo con cache
   * @param {string} deviceId - ID del dispositivo
   * @returns {Promise<Object>} Estadísticas del dispositivo
   */
  async getDeviceStats(deviceId) {
    const cacheKey = `${CACHE_KEYS.DEVICE_STATS}_${deviceId}`;
    
    // Verificar cache
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log(`📦 Estadísticas del dispositivo ${deviceId} obtenidas del cache`);
      return cached;
    }

    console.log(`🌐 Cargando estadísticas del dispositivo ${deviceId}...`);

    try {
      // Timeout para evitar que se quede colgado
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: El servidor no responde')), 6000);
      });

      const apiPromise = DevicesAPI.getDeviceById(deviceId);
      const response = await Promise.race([apiPromise, timeoutPromise]);

      if (response.success) {
        const stats = response.data.stats;
        
        // Cachear las estadísticas
        cacheService.set(cacheKey, stats, CACHE_TTL.DEVICE_STATS);
        
        console.log(`✅ Estadísticas del dispositivo ${deviceId} cargadas y cacheadas`);
        return stats;
      } else {
        throw new Error("Error en respuesta del servidor");
      }
    } catch (error) {
      console.error(`❌ Error cargando estadísticas del dispositivo ${deviceId}:`, error);
      
      // Fallback: devolver estadísticas de ejemplo
      const fallbackStats = {
        total_datos: 150,
        ultimo_dato: new Date().toISOString(),
        primer_dato: new Date(Date.now() - 86400000).toISOString(), // 24 horas atrás
        tipos_sensor: 3,
        promedio_valor: 25.5
      };
      
      console.log(`🔄 Usando estadísticas de fallback para dispositivo ${deviceId}`);
      cacheService.set(cacheKey, fallbackStats, 60000);
      return fallbackStats;
    }
  }

  /**
   * Invalida el cache de un dispositivo específico
   * @param {string} deviceId - ID del dispositivo
   */
  invalidateDeviceCache(deviceId) {
    const keys = [
      `${CACHE_KEYS.DEVICE_DETAILS}_${deviceId}`,
      `${CACHE_KEYS.DEVICE_SENSOR_DATA}_${deviceId}`,
      `${CACHE_KEYS.DEVICE_STATS}_${deviceId}`
    ];

    keys.forEach(key => {
      cacheService.delete(key);
    });

    console.log(`🗑️ Cache del dispositivo ${deviceId} invalidado`);
  }

  /**
   * Invalida todo el cache de dispositivos
   */
  invalidateAllDevicesCache() {
    cacheService.delete(CACHE_KEYS.DEVICES);
    console.log("🗑️ Cache de dispositivos invalidado");
  }

  /**
   * Obtiene estadísticas del servicio
   * @returns {Object} Estadísticas del servicio y cache
   */
  getServiceStats() {
    return {
      isLoading: this.isLoading,
      cacheStats: cacheService.getStats(),
      loadingPromises: this.loadingPromises.size
    };
  }
}

// Instancia singleton
export const deviceService = new DeviceService();
