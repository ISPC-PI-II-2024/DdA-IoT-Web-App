// ==========================
// Página de configuración avanzada
// Acceso solo para administradores
// Configuración de umbrales, triggers y parámetros del sistema
// ==========================
import { el } from "../utils/dom.js";
import { getState } from "../state/store.js";
import { ConfigAPI } from "../api.js";
import { configService } from "../utils/configService.js";

export async function render() {
  const { role } = getState();
  
  // Verificar acceso de admin
  if (role !== "admin") {
    return el("div", { class: "container" },
      el("div", { class: "card error" },
        el("h2", {}, "Acceso Denegado"),
        el("p", {}, "Solo los administradores pueden acceder a la configuración avanzada."),
        el("button", { 
          class: "btn",
          onClick: () => location.hash = "#/configuracion"
        }, "Volver a Configuración")
      )
    );
  }

  // Configuración de umbrales para temperatura
  const umbralesTemperatura = el("div", { class: "card" },
    el("h3", {}, "Umbrales de Temperatura"),
    el("div", { class: "form-section" },
      el("div", { class: "form-group" },
        el("label", { for: "temp_min_normal" }, "Temperatura Mínima Normal (°C):"),
        el("input", { 
          type: "number", 
          id: "temp_min_normal", 
          name: "temp_min_normal", 
          step: "0.1",
          placeholder: "18.0"
        })
      ),
      
      el("div", { class: "form-group" },
        el("label", { for: "temp_max_normal" }, "Temperatura Máxima Normal (°C):"),
        el("input", { 
          type: "number", 
          id: "temp_max_normal", 
          name: "temp_max_normal", 
          step: "0.1",
          placeholder: "25.0"
        })
      ),
      
      el("div", { class: "form-group" },
        el("label", { for: "temp_alerta_calor" }, "Umbral Alert Alarm (Calor) (°C):"),
        el("input", { 
          type: "number", 
          id: "temp_alerta_calor", 
          name: "temp_alerta_calor", 
          step: "0.1",
          placeholder: "30.0"
        })
      ),
      
      el("div", { class: "form-group" },
        el("label", { for: "temp_alerta_frio" }, "Umbral Alert Alarm (Frío) (°C):"),
        el("input", { 
          type: "number", 
          id: "temp_alerta_frio", 
          name: "temp_alerta_frio", 
          step: "0.1",
          placeholder: "5.0"
        })
      ),
      
      el("div", { class: "form-group" },
        el("label", { class: "checkbox-label" },
          el("input", { 
            type: "checkbox", 
            id: "enable_temp_alerts",
            name: "enable_temp_alerts"
          }),
          " Habilitar alertas de temperatura"
        )
      )
    )
  );

  // Configuración de triggers para gráficos
  const triggersGraficos = el("div", { class: "card" },
    el("h3", {}, "Triggers de Gráficos"),
    el("div", { class: "form-section" },
      el("div", { class: "form-group" },
        el("label", { for: "chart_update_interval" }, "Intervalo de actualización (ms):"),
        el("input", { 
          type: "number", 
          id: "chart_update_interval", 
          name: "chart_update_interval", 
          min: "100",
          value: "1000",
          placeholder: "1000"
        })
      ),
      
      el("div", { class: "form-group" },
        el("label", { for: "chart_data_points" }, "Puntos máximos de datos:"),
        el("input", { 
          type: "number", 
          id: "chart_data_points", 
          name: "chart_data_points", 
          min: "10",
          max: "1000",
          value: "60",
          placeholder: "60"
        })
      ),
      
      el("div", { class: "form-group" },
        el("label", { for: "auto_scale_charts" }, "Escalado automático:"),
        el("select", { id: "auto_scale_charts", name: "auto_scale_charts" },
          el("option", { value: "true" }, "Habilitado"),
          el("option", { value: "false" }, "Deshabilitado")
        )
      ),
      
      el("div", { class: "form-group" },
        el("label", { class: "checkbox-label" },
          el("input", { 
            type: "checkbox", 
            id: "enable_real_time",
            name: "enable_real_time"
          }),
          " Modo tiempo real (actualizaciones continuas)"
        )
      )
    )
  );

  // Configuración del sistema MQTT
  const configMQTT = el("div", { class: "card" },
    el("h3", {}, "Configuración MQTT"),
    el("div", { class: "form-section" },
      el("div", { class: "form-group" },
        el("label", { for: "mqtt_topics" }, "Topics MQTT (separados por coma):"),
        el("textarea", { 
          id: "mqtt_topics", 
          name: "mqtt_topics", 
          rows: "3",
          placeholder: "vittoriodurigutti/prueba,vittoriodurigutti/temperature"
        })
      ),
      
      el("div", { class: "form-group" },
        el("label", { for: "mqtt_qos_level" }, "Nivel QoS:"),
        el("select", { id: "mqtt_qos_level", name: "mqtt_qos_level" },
          el("option", { value: "0" }, "QoS 0 - Al menos una vez"),
          el("option", { value: "1" }, "QoS 1 - Exactamente una vez"),
          el("option", { value: "2" }, "QoS 2 - Máximo una vez")
        )
      ),
      
      el("div", { class: "form-group" },
        el("label", { for: "mqtt_timeout" }, "Timeout de conexión (ms):"),
        el("input", { 
          type: "number", 
          id: "mqtt_timeout", 
          name: "mqtt_timeout", 
          min: "1000",
          value: "30000",
          placeholder: "30000"
        })
      )
    )
  );

  // Configuración de notificaciones avanzadas
  const notificacionesAvanzadas = el("div", { class: "card" },
    el("h3", {}, "Notificaciones Avanzadas"),
    el("div", { class: "form-section" },
      el("div", { class: "form-group" },
        el("label", { for: "email_notifications" }, "Notificaciones por Email:"),
        el("input", { 
          type: "email", 
          id: "email_notifications", 
          name: "email_notifications", 
          placeholder: "admin@empresa.com"
        })
      ),
      
      el("div", { class: "form-group" },
        el("label", { for: "notification_cooldown" }, "Cooldown entre notificaciones (minutos):"),
        el("input", { 
          type: "number", 
          id: "notification_cooldown", 
          name: "notification_cooldown", 
          min: "1",
          value: "5",
          placeholder: "5"
        })
      ),
      
      el("div", { class: "form-group" },
        el("label", { class: "checkbox-label" },
          el("input", { 
            type: "checkbox", 
            id: "enable_logging",
            name: "enable_logging"
          }),
          " Habilitar logging detallado"
        )
      ),
      
      el("div", { class: "form-group" },
        el("label", { class: "checkbox-label" },
          el("input", { 
            type: "checkbox", 
            id: "enable_debug_mode",
            name: "enable_debug_mode"
          }),
          " Modo debug (solo desarrollo)"
        )
      )
    )
  );

  // Panel de acciones administrativas
  const accionesAdmin = el("div", { class: "card admin-actions" },
    el("h3", {}, "Acciones Administrativas"),
    el("div", { class: "form-section" },
      el("div", { class: "actions-grid" },
        el("button", { 
          class: "btn btn-action",
          onClick: () => reloadMQTTConnection()
        }, "Reiniciar Conexión MQTT"),
        
        el("button", { 
          class: "btn btn-action",
          onClick: () => clearDataCache()
        }, "Limpiar Cache de Datos"),
        
        el("button", { 
          class: "btn btn-action",
          onClick: () => exportConfiguration()
        }, "Exportar Configuración"),
        
        el("button", { 
          class: "btn btn-action",
          onClick: () => importConfiguration()
        }, "Importar Configuración"),
        
        el("button", { 
          class: "btn btn-danger",
          onClick: () => resetSystemConfig()
        }, "Resetear Sistema")
      )
    )
  );

  // Funciones para manejar la configuración avanzada
  window.saveAdvancedConfig = async function() {
    const config = {
      thresholds: {
        tempMinNormal: parseFloat(document.getElementById("temp_min_normal").value) || 18.0,
        tempMaxNormal: parseFloat(document.getElementById("temp_max_normal").value) || 25.0,
        tempAlertaCalor: parseFloat(document.getElementById("temp_alerta_calor").value) || 30.0,
        tempAlertaFrio: parseFloat(document.getElementById("temp_alerta_frio").value) || 5.0,
        enableTempAlerts: document.getElementById("enable_temp_alerts").checked
      },
      charts: {
        updateInterval: parseInt(document.getElementById("chart_update_interval").value) || 1000,
        dataPoints: parseInt(document.getElementById("chart_data_points").value) || 60,
        autoScale: document.getElementById("auto_scale_charts").value === "true",
        realTime: document.getElementById("enable_real_time").checked
      },
      mqtt: {
        topics: document.getElementById("mqtt_topics").value.split(',').map(t => t.trim()),
        qosLevel: parseInt(document.getElementById("mqtt_qos_level").value),
        timeout: parseInt(document.getElementById("mqtt_timeout").value) || 30000
      },
      notifications: {
        email: document.getElementById("email_notifications").value,
        cooldown: parseInt(document.getElementById("notification_cooldown").value) || 5,
        logging: document.getElementById("enable_logging").checked,
        debugMode: document.getElementById("enable_debug_mode").checked
      }
    };
    
    try {
      // Guardar usando ConfigService (que sincroniza local y remoto)
      const success = await configService.setAdvancesConfig(config);
      
      if (success) {
        alert("Configuración avanzada guardada exitosamente");
        console.log("Configuración avanzada:", config);
      } else {
        throw new Error("Error guardando configuración");
      }
      
    } catch (error) {
      console.error("Error guardando configuración avanzada:", error);
      alert("Error guardando la configuración");
    }
  };

  // Funciones de acciones administrativas
  window.reloadMQTTConnection = async function() {
    if (confirm("¿Reiniciar la conexión MQTT? Esto puede interrumpir temporalmente la recepción de datos.")) {
      try {
        await ConfigAPI.restartMQTTConnection();
        alert("Conexión MQTT reiniciada");
      } catch (error) {
        alert("Error reiniciando conexión MQTT: " + error.message);
      }
    }
  };

  window.clearDataCache = async function() {
    if (confirm("¿Limpiar el cache de datos? Los datos en memoria se perderán.")) {
      try {
        await ConfigAPI.clearDataCache();
        alert("Cache de datos limpiado");
      } catch (error) {
        alert("Error limpiando cache: " + error.message);
      }
    }
  };

  window.exportConfiguration = function() {
    try {
      const configData = configService.exportConfig();
      const dataStr = JSON.stringify(configData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `configuracion-sistema-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(link.href);
    } catch (error) {
      alert("Error exportando configuración");
    }
  };

  window.importConfiguration = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const config = JSON.parse(e.target.result);
            localStorage.setItem("advanced_config", JSON.stringify(config));
            alert("Configuración importada exitosamente");
            location.reload(); // Recargar para aplicar cambios
          } catch (error) {
            alert("Error importando configuración: formato inválido");
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.send();
  };

  window.resetSystemConfig = function() {
    if (confirm("¿Resetear toda la configuración del sistema a valores por defecto? Esta acción no se puede deshacer.")) {
      if (confirm("Esta acción eliminará TODA la configuración personalizada. ¿Continuar?")) {
        try {
          configService.resetAll();
          alert("Configuración del sistema reseteada");
          location.reload();
        } catch (error) {
          alert("Error reseteando configuración");
        }
      }
    }
  };

  // Cargar configuración existente usando ConfigService
  const loadAdvancedConfig = async () => {
    try {
      // Primero intentar cargar desde el servidor (solo admin)
      try {
        const serverConfig = await configService.loadFromServer("advanced");
        configService.setAdvancedConfig(serverConfig);
      } catch (error) {
        console.warn("No se pudo cargar configuración del servidor, usando local:", error);
      }
      
      // Luego cargar desde ConfigService
      const config = configService.getAdvancedConfig();
      
      // Cargar umbrales
      if (config.thresholds) {
        document.getElementById("temp_min_normal").value = config.thresholds.tempMinNormal || "";
        document.getElementById("temp_max_normal").value = config.thresholds.tempMaxNormal || "";
        document.getElementById("temp_alerta_calor").value = config.thresholds.tempAlertaCalor || "";
        document.getElementById("temp_alerta_frio").value = config.thresholds.tempAlertaFrio || "";
        document.getElementById("enable_temp_alerts").checked = config.thresholds.enableTempAlerts || false;
      }
      
      // Cargar configuración de gráficos
      if (config.charts) {
        document.getElementById("chart_update_interval").value = config.charts.updateInterval || 1000;
        document.getElementById("chart_data_points").value = config.charts.dataPoints || 60;
        document.getElementById("auto_scale_charts").value = config.charts.autoScale ? "true" : "false";
        document.getElementById("enable_real_time").checked = config.charts.realTime || false;
      }

      // Cargar configuración MQTT
      if (config.mqtt) {
        document.getElementById("mqtt_topics").value = config.mqtt.topics?.join(", ") || "";
        document.getElementById("mqtt_qos_level").value = config.mqtt.qosLevel || "1";
        document.getElementById("mqtt_timeout").value = config.mqtt.timeout || 30000;
      }
      
      // Cargar configuración de notificaciones
      if (config.notifications) {
        document.getElementById("email_notifications").value = config.notifications.email || "";
        document.getElementById("notification_cooldown").value = config.notifications.cooldown || 5;
        document.getElementById("enable_logging").checked = config.notifications.logging || false;
        document.getElementById("enable_debug_mode").checked = config.notifications.debugMode || false;
      }
      
    } catch (error) {
      console.error("Error cargando configuración avanzada:", error);
    }
  };

  // Cargar configuración cuando se monta el componente
  setTimeout(loadAdvancedConfig, 100);

  return el("div", { class: "advanced-config-container" },
    el("div", { class: "config-header" },
      el("div", { class: "header-actions" },
        el("button", { 
          class: "btn btn-secondary",
          onClick: () => location.hash = "#/configuracion"
        }, "← Volver"),
        el("button", { 
          class: "btn",
          onClick: () => saveAdvancedConfig()
        }, "Guardar Configuración")
      ),
      el("h2", {}, "Configuración Avanzada"),
      el("p", { class: "muted" }, "Configuración administrativa del sistema IoT")
    ),
    
    el("div", { class: "grid cols-2" },
      el("div", {}, umbralesTemperatura, triggersGraficos),
      el("div", {}, configMQTT, notificacionesAvanzadas)
    ),
    
    accionesAdmin
  );
}
