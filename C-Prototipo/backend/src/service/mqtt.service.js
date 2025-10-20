// ==========================
// Servicio MQTT para conectar con Mosquitto
// Configuración completa desde .env: host, port, usuario, contraseña, topics
// Los tópicos se obtienen desde la base de datos con fallback a ENV
// ==========================
import mqtt from "mqtt";
import { ENV } from "../config/env.js";
import { pool } from "../db/index.js";

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.temperatureData = [];
    this.maxDataPoints = 100; // Mantener últimos 100 puntos
    this.subscribers = new Set(); // Para WebSocket broadcasting
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.topics = []; // Tópicos obtenidos desde DB
    this.topicsFromDB = false; // Flag para saber si se obtuvieron desde DB
  }

  /**
   * Carga los tópicos MQTT desde la base de datos
   * Si falla, usa los tópicos de las variables de entorno como fallback
   */
  async loadTopicsFromDB() {
    try {
      const conn = await pool.getConnection();
      
      // Intentar obtener tópicos desde la tabla mqtt_topics
      const [topicsRows] = await conn.execute(`
        SELECT nombre, qos_level, tipo_datos, metadatos 
        FROM mqtt_topics 
        WHERE activo = TRUE 
        ORDER BY fecha_creacion ASC
      `);
      
      conn.release();
      
      if (topicsRows.length > 0) {
        this.topics = topicsRows.map(row => row.nombre);
        this.topicsFromDB = true;
        console.log(`✅ Tópicos cargados desde DB: ${this.topics.length} tópicos`);
        
        // Log de información adicional de los tópicos
        topicsRows.forEach(topic => {
          console.log(`  📡 ${topic.nombre} (QoS: ${topic.qos_level}, Tipo: ${topic.tipo_datos})`);
        });
        
        return;
      }
      
      // Si no hay tópicos en la tabla específica, intentar desde configuraciones_sistema
      const conn2 = await pool.getConnection();
      const [configRows] = await conn2.execute(`
        SELECT valor FROM configuraciones_sistema 
        WHERE clave = 'mqtt_topics_default' AND valor IS NOT NULL
      `);
      conn2.release();
      
      if (configRows.length > 0 && configRows[0].valor) {
        this.topics = configRows[0].valor.split(',').map(t => t.trim()).filter(Boolean);
        this.topicsFromDB = true;
        console.log(`✅ Tópicos cargados desde configuraciones_sistema: ${this.topics.length} tópicos`);
        return;
      }
      
    } catch (error) {
      console.error("❌ Error cargando tópicos desde DB:", error.message);
    }
    
    // Fallback a variables de entorno
    this.topics = [...ENV.MQTT_TOPICS];
    this.topicsFromDB = false;
    console.log(`⚠️ Usando tópicos de ENV como fallback: ${this.topics.length} tópicos`);
  }

  async connect() {
    // Obtener tópicos desde la base de datos primero
    await this.loadTopicsFromDB();
    
    // Construir URL del broker desde configuración ENV
    const brokerUrl = this.buildBrokerUrl();
    const clientOptions = this.buildClientOptions();
    
    console.log(`🔌 Conectando a MQTT broker: ${brokerUrl}`);
    console.log(`📡 Topics configurados: ${this.topics.join(", ")}`);
    console.log(`📊 Fuente de tópicos: ${this.topicsFromDB ? 'Base de datos' : 'Variables de entorno'}`);
    
    this.client = mqtt.connect(brokerUrl, clientOptions);

    this.client.on("connect", () => {
      console.log("✅ Conectado a MQTT broker");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.subscribeToTopics();
    });

    this.client.on("error", (error) => {
      console.error("❌ Error MQTT:", error);
      this.isConnected = false;
    });

    this.client.on("disconnect", () => {
      console.log("🔌 Desconectado de MQTT broker");
      this.isConnected = false;
    });

    this.client.on("reconnect", () => {
      this.reconnectAttempts++;
      console.log(`🔄 Reconectando a MQTT broker... (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("❌ Máximo número de intentos de reconexión alcanzado");
        this.client.end();
      }
    });

    this.client.on("offline", () => {
      console.log("📴 Cliente MQTT offline");
      this.isConnected = false;
    });

    this.client.on("close", () => {
      console.log("🔒 Conexión MQTT cerrada");
      this.isConnected = false;
    });
  }

  buildBrokerUrl() {
    const protocol = ENV.MQTT_BROKER_PORT === 8883 ? "mqtts" : "mqtt";
    return `${protocol}://${ENV.MQTT_BROKER_HOST}:${ENV.MQTT_BROKER_PORT}`;
  }

  buildClientOptions() {
    const options = {
      clientId: `iot-webapp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30 * 1000,
      keepalive: 60,
      qos: 1, // Al menos una vez
      retain: false
    };

    // Agregar autenticación si está configurada
    if (ENV.MQTT_BROKER_USERNAME && ENV.MQTT_BROKER_PASSWORD) {
      options.username = ENV.MQTT_BROKER_USERNAME;
      options.password = ENV.MQTT_BROKER_PASSWORD;
      console.log(`🔐 Usando autenticación MQTT: ${ENV.MQTT_BROKER_USERNAME}`);
    }

    // Configuración SSL/TLS para puerto 8883
    if (ENV.MQTT_BROKER_PORT === 8883) {
      options.rejectUnauthorized = false; // Para desarrollo, en producción usar certificados válidos
    }

    return options;
  }

  subscribeToTopics() {
    if (!this.client || !this.isConnected) {
      console.error("❌ Cliente MQTT no conectado, no se pueden suscribir topics");
      return;
    }

    console.log(`📡 Suscribiéndose a ${this.topics.length} topics...`);

    this.topics.forEach(topic => {
      this.client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌ Error suscribiéndose a ${topic}:`, err);
        } else {
          console.log(`✅ Suscrito a: ${topic}`);
        }
      });
    });

    this.client.on("message", (topic, message) => {
      this.handleMessage(topic, message);
    });
  }

  handleMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString());
      const timestamp = new Date().toISOString();
      
      console.log(`📨 MQTT [${topic}]:`, data);

      // Procesar datos de temperatura
      if (this.isTemperatureData(data)) {
        const temperaturePoint = {
          timestamp,
          topic,
          temperature: parseFloat(data.temperature || data.temp || data.value),
          humidity: data.humidity ? parseFloat(data.humidity) : null,
          sensor_id: data.sensor_id || data.id || "unknown",
          raw_data: data
        };

        this.addTemperatureData(temperaturePoint);
        this.broadcastToSubscribers(temperaturePoint);
      } else {
        // Log de otros tipos de datos para debugging
        console.log(`📊 Datos no-temperatura recibidos en ${topic}:`, data);
      }
    } catch (error) {
      console.error("❌ Error procesando mensaje MQTT:", error);
      // Intentar como texto plano
      const textMessage = message.toString();
      console.log(`📨 MQTT [${topic}] (texto):`, textMessage);
      
      // Intentar parsear como número simple
      const numericValue = parseFloat(textMessage);
      if (!isNaN(numericValue)) {
        const temperaturePoint = {
          timestamp: new Date().toISOString(),
          topic,
          temperature: numericValue,
          humidity: null,
          sensor_id: "text_sensor",
          raw_data: { value: numericValue, source: "text" }
        };
        
        this.addTemperatureData(temperaturePoint);
        this.broadcastToSubscribers(temperaturePoint);
      }
    }
  }

  isTemperatureData(data) {
    return data && (
      typeof data.temperature === 'number' ||
      typeof data.temp === 'number' ||
      typeof data.value === 'number' ||
      !isNaN(parseFloat(data.temperature)) ||
      !isNaN(parseFloat(data.temp)) ||
      !isNaN(parseFloat(data.value))
    );
  }

  addTemperatureData(point) {
    this.temperatureData.push(point);
    
    // Mantener solo los últimos N puntos
    if (this.temperatureData.length > this.maxDataPoints) {
      this.temperatureData = this.temperatureData.slice(-this.maxDataPoints);
    }
  }

  broadcastToSubscribers(data) {
    const message = JSON.stringify({
      type: "temperature_update",
      data: data,
      timestamp: data.timestamp
    });

    this.subscribers.forEach(subscriber => {
      try {
        if (subscriber.readyState === 1) { // WebSocket.OPEN
          subscriber.send(message);
        } else {
          // Remover suscriptores cerrados
          this.subscribers.delete(subscriber);
        }
      } catch (error) {
        console.error("❌ Error enviando a WebSocket:", error);
        this.subscribers.delete(subscriber);
      }
    });
  }

  addSubscriber(ws) {
    this.subscribers.add(ws);
    console.log(`📡 Nuevo suscriptor WebSocket. Total: ${this.subscribers.size}`);
  }

  removeSubscriber(ws) {
    this.subscribers.delete(ws);
    console.log(`📡 Suscriptor WebSocket removido. Total: ${this.subscribers.size}`);
  }

  getTemperatureData(limit = 50) {
    return this.temperatureData.slice(-limit);
  }

  getLatestTemperature() {
    return this.temperatureData.length > 0 
      ? this.temperatureData[this.temperatureData.length - 1] 
      : null;
  }

  getStats() {
    if (this.temperatureData.length === 0) {
      return { count: 0, avg: null, min: null, max: null };
    }

    const temps = this.temperatureData.map(d => d.temperature).filter(t => !isNaN(t));
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
    const min = Math.min(...temps);
    const max = Math.max(...temps);

    return {
      count: this.temperatureData.length,
      avg: Math.round(avg * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      latest: this.getLatestTemperature()
    };
  }

  getConnectionInfo() {
    return {
      connected: this.isConnected,
      brokerUrl: this.buildBrokerUrl(),
      topics: this.topics,
      topicsFromDB: this.topicsFromDB,
      subscriberCount: this.subscribers.size,
      dataCount: this.temperatureData.length,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Recarga los tópicos desde la base de datos
   * Útil para actualizar tópicos sin reiniciar el servicio
   */
  async reloadTopics() {
    console.log("🔄 Recargando tópicos desde la base de datos...");
    await this.loadTopicsFromDB();
    
    if (this.isConnected) {
      console.log("📡 Re-suscribiéndose a los nuevos tópicos...");
      this.subscribeToTopics();
    }
    
    return {
      topics: this.topics,
      topicsFromDB: this.topicsFromDB,
      count: this.topics.length
    };
  }

  disconnect() {
    if (this.client) {
      console.log("🔌 Desconectando cliente MQTT...");
      this.client.end();
      this.isConnected = false;
    }
  }

  // Método para publicar datos (opcional, para testing)
  publish(topic, message) {
    if (!this.client || !this.isConnected) {
      console.error("❌ Cliente MQTT no conectado, no se puede publicar");
      return false;
    }

    try {
      this.client.publish(topic, JSON.stringify(message), { qos: 1 });
      console.log(`📤 Publicado en ${topic}:`, message);
      return true;
    } catch (error) {
      console.error("❌ Error publicando mensaje:", error);
      return false;
    }
  }
}

// Instancia singleton
export const mqttService = new MQTTService();
