// ==========================
// Controladores para configuración del sistema
// - Configuración general (todos los usuarios autenticados)
// - Configuración avanzada (solo admin)
// - Umbrales y triggers
// ==========================

export async function getGeneralConfig(req, res) {
  try {
    // Configuración básica accesible para todos los usuarios autenticados
    const config = {
      systemInfo: {
        version: "1.0.0",
        lastUpdate: new Date().toISOString().split('T')[0],
        status: "online",
        dataCount: Math.floor(Math.random() * 10000) + 1000 // Simulado
      },
      allowedSettings: {
        temperatureUnit: ["celsius", "fahrenheit"],
        chartRefreshIntervals: [1000, 5000, 30000],
        maxChartPoints: 1000
      },
      userRole: req.user?.role || "guest"
    };

    res.json({
      success: true,
      config: config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error obteniendo configuración general:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error interno del servidor" 
    });
  }
}

export async function getAdvancedConfig(req, res) {
  try {
    // Solo admin puede ver configuración avanzada
    if (req.user?.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Acceso denegado. Solo administradores" 
      });
    }

    // Configuración avanzada (en producción, esto vendría de una BD)
    const config = {
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
      },
      system: {
        maintenanceMode: false,
        backupEnabled: true,
        logLevel: "info"
      }
    };

    res.json({
      success: true,
      config: config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error obteniendo configuración avanzada:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error interno del servidor" 
    });
  }
}

export async function updateAdvancedConfig(req, res) {
  try {
    // Solo admin puede actualizar configuración avanzada
    if (req.user?.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Acceso denegado. Solo administradores" 
      });
    }

    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({
        success: false,
        error: "Configuración requerida"
      });
    }

    // Validar configuración básica
    if (config.thresholds) {
      validateThresholds(config.thresholds);
    }
    
    if (config.charts) {
      validateChartsConfig(config.charts);
    }
    
    if (config.mqtt) {
      validateMQTTConfig(config.mqtt);
    }

    // En producción, esto se guardaría en BD
    // Por ahora, retornamos éxito
    console.log("Configuración avanzada actualizada:", config);
    console.log("Usuario:", req.user.email);

    res.json({
      success: true,
      message: "Configuración avanzada actualizada exitosamente",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error actualizando configuración avanzada:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Error interno del servidor" 
    });
  }
}

export async function getMQTTStatus(req, res) {
  try {
    // URL externa para obtener estado MQTT desde el servicio
    const mqttService = await import("../service/mqtt.service.js").then(m => m.mqttService);
    const connectionInfo = mqttService.getConnectionInfo();
    
    res.json({
      success: true,
      mqtt: connectionInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error obteniendo estado MQTT:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error interno del servidor" 
    });
  }
}

export async function restartMQTTConnection(req, res) {
  try {
    // Solo admin puede reiniciar conexión MQTT
    if (req.user?.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Acceso denegado. Solo administradores" 
      });
    }

    const mqttService = await import("../service/mqtt.service.js").then(m => m.mqttService);
    
    // Reiniciar conexión
    mqttService.disconnect();
    setTimeout(() => {
      mqttService.connect();
    }, 2000);

    res.json({
      success: true,
      message: "Conexión MQTT reiniciada",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error reiniciando conexión MQTT:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error interno del servidor" 
    });
  }
}

export async function clearDataCache(req, res) {
  try {
    // Solo admin puede limpiar cache
    if (req.user?.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        error: "Acceso denegado. Solo administradores" 
      });
    }

    const mqttService = await import("../service/mqtt.service.js").then(m => m.mqttService);
    
    // Limpiar datos de temperatura almacenados
    mqttService.temperatureData = []; // Acceder directamente a la propiedad
    
    console.log("Cache de datos limpiado por:", req.user.email);

    res.json({
      success: true,
      message: "Cache de datos limpiado exitosamente",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error limpiando cache:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error interno del servidor" 
    });
  }
}

// Funciones de validación
function validateThresholds(thresholds) {
  if (thresholds.tempMinNormal && thresholds.tempMaxNormal) {
    if (thresholds.tempMinNormal >= thresholds.tempMaxNormal) {
      throw new Error("Temperatura mínima debe ser menor que máxima");
    }
  }
  
  if (thresholds.tempAlertaCalor && thresholds.tempMaxNormal) {
    if (thresholds.tempAlertaCalor <= thresholds.tempMaxNormal) {
      throw new Error("Umbral de alerta de calor debe ser mayor que temperatura máxima normal");
    }
  }
  
  if (thresholds.tempAlertaFrio && thresholds.tempMinNormal) {
    if (thresholds.tempAlertaFrio >= thresholds.tempMinNormal) {
      throw new Error("Umbral de alerta de frío debe ser menor que temperatura mínima normal");
    }
  }
}

function validateChartsConfig(charts) {
  if (charts.updateInterval && (charts.updateInterval < 100 || charts.updateInterval > 60000)) {
    throw new Error("Intervalo de actualización debe estar entre 100ms y 60s");
  }
  
  if (charts.dataPoints && (charts.dataPoints < 10 || charts.dataPoints > 1000)) {
    throw new Error("Puntos de datos debe estar entre 10 y 1000");
  }
}

function validateMQTTConfig(mqtt) {
  if (mqtt.topics && !Array.isArray(mqtt.topics)) {
    throw new Error("Topics MQTT debe ser un array");
  }
  
  if (mqtt.qosLevel && ![0, 1, 2].includes(mqtt.qosLevel)) {
    throw new Error("Nivel QoS debe ser 0, 1 o 2");
  }
  
  if (mqtt.timeout && (mqtt.timeout < 1000 || mqtt.timeout > 300000)) {
    throw new Error("Timeout debe estar entre 1s y 5m");
  }
}
