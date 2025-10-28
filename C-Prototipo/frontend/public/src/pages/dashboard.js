import { el } from "../utils/dom.js";
import { getState, subscribe } from "../state/store.js";
import { chartWidget } from "../components/chartWidget.js";
import { temperatureChartWidget } from "../components/temperatureChart.js";
import { deviceSelectorWidget, selectedDeviceInfoWidget } from "../components/deviceSelector.js";
import { generalStatusWidget } from "../components/generalStatusWidget.js";
import { deviceVisualizationWidget } from "../components/deviceVisualization.js";
import { systemStatusWidget } from "../components/systemStatusWidget.js";
import { mqttLogsWidget } from "../components/mqttLogsWidget.js";
import { alertWidget } from "../components/alertWidget.js";
import { deviceService } from "../utils/deviceService.js";
import { GatewayAPI } from "../api.js";
import { alertService } from "../utils/alertService.js";
import { rtClient } from "../ws.js";

export async function render() {
  const { role, currentProject, selectedDevice } = getState();

  // Asegurar conexión WS (si aún no conectó)
  if (!rtClient.ws) {
    try { await rtClient.connect(); } catch (e) { console.error("WS connect:", e); }
  }
  
  // Exponer alertService globalmente para el WebSocket
  window.alertService = alertService;
  
  // Solicitar permiso para notificaciones
  alertService.requestNotificationPermission();

  const header = el("div", { class: "card card-feature" },
    el("h2", { class: "text-2xl font-bold mb-2" }, "Panel de dispositivos IoT"),
    el("p", { class: "muted text-lg" }, `Proyecto actual: ${currentProject ?? "—"}`)
  );

  // Widget de estado general con indicadores LED
  const generalStatus = await generalStatusWidget();

    // Widget de estado del sistema (gateways, endpoints, sensores)
    const systemStatus = await systemStatusWidget();

    // Widget de logs MQTT en tiempo real
    const mqttLogs = mqttLogsWidget();

    // Widget de alertas activas
    const alertsWidget = alertWidget();

    // Selector de dispositivos
    const deviceSelector = await deviceSelectorWidget();
  
  // Información del dispositivo seleccionado (solo se muestra si hay un dispositivo seleccionado)
  const deviceInfo = selectedDevice ? selectedDeviceInfoWidget() : null;

  // Visualización SVG del dispositivo (solo se muestra si hay un dispositivo seleccionado)
  const deviceVisualization = selectedDevice ? await deviceVisualizationWidget(selectedDevice) : null;

  // Contenedor para datos específicos del dispositivo
  const deviceDataContainer = el("div", {
    id: "device-data-container",
    style: "margin-top: 20px;"
  });

  // Función para cargar datos de endpoint desde gateway/sensor topic
  async function loadEndpointData(device) {
    try {
      // Obtener endpoint ID (prioridad: id_endpoint > id_dispositivo)
      const endpointId = device.id_endpoint || device.id_dispositivo;
      
      // Obtener datos del endpoint con sus sensores
      const endpointData = await GatewayAPI.getEndpointById(endpointId);
      
      if (endpointData && endpointData.success) {
        const { endpoint, sensors } = endpointData.data;
        
        // Limpiar contenedor
        deviceDataContainer.innerHTML = "";
        
        // Card de información del endpoint
        const endpointInfoCard = el("div", { class: "card" },
          el("h3", {}, `Endpoint: ${endpointId}`),
          el("div", { class: "grid cols-2" },
            el("div", {},
              el("p", {}, el("strong", {}, "Batería: "), `${endpoint.bateria}%`),
              el("p", {}, el("strong", {}, "Cargando: "), endpoint.cargando ? 'Sí' : 'No'),
            ),
            el("div", {},
              el("p", {}, el("strong", {}, "LoRa: "), endpoint.lora),
              el("p", {}, el("strong", {}, "Sensores: "), endpoint.sensores || sensors.length)
            )
          )
        );
        
        deviceDataContainer.appendChild(endpointInfoCard);
        
        // Card con tabla de sensores del gateway/sensor topic
        if (sensors && sensors.length > 0) {
          const sensorsCard = el("div", { class: "card" },
            el("h3", {}, "Sensores del Endpoint"),
            el("div", { style: "overflow-x: auto;" },
              el("table", { style: "width: 100%; border-collapse: collapse;" },
                el("thead", {},
                  el("tr", { style: "background-color: #f5f5f5;" },
                    el("th", { style: "padding: 10px; text-align: left; border: 1px solid #ddd;" }, "ID Sensor"),
                    el("th", { style: "padding: 10px; text-align: left; border: 1px solid #ddd;" }, "Posición"),
                    el("th", { style: "padding: 10px; text-align: left; border: 1px solid #ddd;" }, "Temperatura (°C)"),
                    el("th", { style: "padding: 10px; text-align: left; border: 1px solid #ddd;" }, "Humedad (%)"),
                    el("th", { style: "padding: 10px; text-align: left; border: 1px solid #ddd;" }, "Estado")
                  )
                ),
                el("tbody", {},
                  ...sensors.map(sensor => 
                    el("tr", {},
                      el("td", { style: "padding: 8px; border: 1px solid #ddd;" }, sensor.id || 'N/A'),
                      el("td", { style: "padding: 8px; border: 1px solid #ddd;" }, sensor.posicion || 'N/A'),
                      el("td", { 
                        style: `padding: 8px; border: 1px solid #ddd; color: ${sensor.temperatura < 15 || sensor.temperatura > 30 ? '#d32f2f' : '#4CAF50'};`
                      }, `${sensor.temperatura || 'N/A'}°C`),
                      el("td", { 
                        style: `padding: 8px; border: 1px solid #ddd; color: ${sensor.humedad < 30 || sensor.humedad > 80 ? '#d32f2f' : '#4CAF50'};`
                      }, `${sensor.humedad || 'N/A'}%`),
                      el("td", { 
                        style: `padding: 8px; border: 1px solid #ddd; font-weight: bold; color: ${sensor.estado === 'ok' ? '#4CAF50' : '#d32f2f'};`
                      }, sensor.estado || 'N/A')
                    )
                  )
                )
              )
            )
          );
          
          deviceDataContainer.appendChild(sensorsCard);
        } else {
          deviceDataContainer.appendChild(el("div", { class: "card" },
            el("p", { style: "text-align: center; color: #666; padding: 20px;" }, 
              "No hay sensores disponibles para este endpoint"
            )
          ));
        }
      } else {
        throw new Error('No se pudieron obtener los datos del endpoint');
      }
    } catch (error) {
      console.error('Error cargando datos del endpoint:', error);
      deviceDataContainer.innerHTML = "";
      deviceDataContainer.appendChild(el("div", {
        class: "card",
        style: "text-align: center; color: #d32f2f; padding: 40px;"
      },
        el("div", { style: "font-size: 3em; margin-bottom: 15px;" }, "❌"),
        el("h3", { style: "margin-bottom: 10px;" }, "Error"),
        el("p", {}, error.message || "Error cargando datos del endpoint"),
        el("button", {
          class: "btn btn-secondary",
          style: "margin-top: 20px;",
          onclick: () => loadDeviceData(device)
        }, "🔄 Reintentar")
      ));
    }
  }

  // Función para cargar datos del dispositivo seleccionado
  async function loadDeviceData(device) {
    try {
      // Limpiar contenedor anterior
      deviceDataContainer.innerHTML = "";
      
      // Verificar que el dispositivo tiene el campo id_dispositivo
      if (!device || !device.id_dispositivo) {
        deviceDataContainer.appendChild(el("div", { class: "card" },
          el("div", { style: "text-align: center; color: #d32f2f; padding: 20px;" }, 
            "❌ Error: Dispositivo inválido o sin identificador"
          )
        ));
        return;
      }
      
      // Mostrar indicador de carga
      deviceDataContainer.appendChild(el("div", {
        style: "text-align: center; padding: 20px; color: #666;"
      }, "Cargando datos del dispositivo..."));
      
      // Si es un endpoint, usar la API de gateway para obtener sensores
      if (device.tipo === 'endpoint' || device.id_endpoint) {
        await loadEndpointData(device);
        return;
      }

      // Obtener datos del dispositivo usando el servicio optimizado
      const [deviceDetails, sensorData] = await Promise.all([
        deviceService.getDeviceDetails(device.id_dispositivo),
        deviceService.getDeviceSensorData(device.id_dispositivo, 50)
      ]);

      // Verificar que recibimos datos válidos
      if (deviceDetails && (sensorData || sensorData === null)) {
        // Obtener estadísticas del dispositivo
        const stats = await deviceService.getDeviceStats(device.id_dispositivo);
        
        // Crear widgets de datos específicos del dispositivo
        const deviceStats = el("div", { class: "card" },
          el("h3", {}, "Estadísticas del Dispositivo"),
          el("div", { class: "grid cols-2" },
            el("div", {},
              el("h4", {}, "Datos de Sensores"),
              el("ul", { style: "list-style: none; padding: 0;" },
                el("li", { style: "margin-bottom: 8px;" }, 
                  el("strong", {}, "Total de datos: "), stats.total_datos || 0
                ),
                el("li", { style: "margin-bottom: 8px;" }, 
                  el("strong", {}, "Tipos de sensores: "), stats.tipos_sensor || 0
                ),
                el("li", { style: "margin-bottom: 8px;" }, 
                  el("strong", {}, "Promedio de valores: "), 
                  stats.promedio_valor ? 
                    parseFloat(stats.promedio_valor).toFixed(2) : 'N/A'
                )
              )
            ),
            el("div", {},
              el("h4", {}, "Período de Datos"),
              el("ul", { style: "list-style: none; padding: 0;" },
                el("li", { style: "margin-bottom: 8px;" }, 
                  el("strong", {}, "Primer dato: "), 
                  stats.primer_dato ? 
                    new Date(stats.primer_dato).toLocaleString() : 'N/A'
                ),
                el("li", { style: "margin-bottom: 8px;" }, 
                  el("strong", {}, "Último dato: "), 
                  stats.ultimo_dato ? 
                    new Date(stats.ultimo_dato).toLocaleString() : 'N/A'
                )
              )
            )
          )
        );

        // Crear tabla de datos de sensores recientes
        const sensorDataTable = el("div", { class: "card" },
          el("h3", {}, "Datos de Sensores Recientes"),
          sensorData.length > 0 ? 
            el("div", { style: "overflow-x: auto;" },
              el("table", { style: "width: 100%; border-collapse: collapse;" },
                el("thead", {},
                  el("tr", { style: "background-color: #f5f5f5;" },
                    el("th", { style: "padding: 10px; text-align: left; border: 1px solid #ddd;" }, "Tipo de Sensor"),
                    el("th", { style: "padding: 10px; text-align: left; border: 1px solid #ddd;" }, "Valor"),
                    el("th", { style: "padding: 10px; text-align: left; border: 1px solid #ddd;" }, "Unidad"),
                    el("th", { style: "padding: 10px; text-align: left; border: 1px solid #ddd;" }, "Timestamp")
                  )
                ),
                el("tbody", {},
                  ...sensorData.slice(0, 10).map(data => 
                    el("tr", {},
                      el("td", { style: "padding: 8px; border: 1px solid #ddd;" }, data.tipo_sensor),
                      el("td", { style: "padding: 8px; border: 1px solid #ddd;" }, data.valor),
                      el("td", { style: "padding: 8px; border: 1px solid #ddd;" }, data.unidad || 'N/A'),
                      el("td", { style: "padding: 8px; border: 1px solid #ddd;" }, 
                        new Date(data.timestamp).toLocaleString()
                      )
                    )
                  )
                )
              )
            ) :
            el("p", { style: "text-align: center; color: #666; padding: 20px;" }, 
              "No hay datos de sensores disponibles para este dispositivo"
            )
        );

        // Limpiar y agregar nuevos elementos
        deviceDataContainer.innerHTML = "";
        deviceDataContainer.appendChild(deviceStats);
        deviceDataContainer.appendChild(sensorDataTable);
      } else {
        // Caso: dispositivo existe pero no tiene datos de sensores
        deviceDataContainer.innerHTML = "";
        deviceDataContainer.appendChild(el("div", { class: "card" },
          el("div", { style: "text-align: center; padding: 40px; color: #666;" },
            el("h3", { style: "margin-bottom: 15px;" }, "⚠️ Sin Datos de Sensores"),
            el("p", {}, 
              "El dispositivo existe pero aún no tiene datos de sensores registrados. " +
              "Los datos aparecerán aquí cuando el dispositivo comience a enviar información."
            )
          )
        ));
      }
    } catch (error) {
      console.error('Error cargando datos del dispositivo:', error);
      deviceDataContainer.innerHTML = "";
      
      // Mensaje de error más descriptivo
      let errorMessage = "Error cargando datos del dispositivo";
      if (error.message) {
        errorMessage += ": " + error.message;
      }
      
      deviceDataContainer.appendChild(el("div", {
        class: "card",
        style: "text-align: center; color: #d32f2f; padding: 40px;"
      },
        el("div", { style: "font-size: 3em; margin-bottom: 15px;" }, "❌"),
        el("h3", { style: "margin-bottom: 10px;" }, "Error"),
        el("p", {}, errorMessage),
        el("button", {
          class: "btn btn-secondary",
          style: "margin-top: 20px;",
          onclick: () => loadDeviceData(device)
        }, "🔄 Reintentar")
      ));
    }
  }

  // Event listener para cuando se selecciona un dispositivo
  deviceSelector.addEventListener('deviceSelected', (e) => {
    loadDeviceData(e.detail.device);
  });

  // Si ya hay un dispositivo seleccionado, cargar sus datos
  if (selectedDevice) {
    loadDeviceData(selectedDevice);
  }

  // Cards que solo se muestran cuando hay un dispositivo seleccionado
  let deviceSpecificCards = null;
  
  if (selectedDevice) {
    // Gráfico de temperatura MQTT (mantenido para compatibilidad)
    const temperatureChart = await temperatureChartWidget({ 
      title: `Temperatura MQTT - ${selectedDevice.nombre}`,
      maxPoints: 60,
      showStats: true
    });

    // Gráfico demo original (mantenido para compatibilidad)
    const rtChart = await chartWidget({ 
      title: `Métrica RT - ${selectedDevice.nombre}`, 
      topic: "metrics/demo" 
    });

    const grids = el("div", { class: "grid cols-2 grid-lg" },
      el("div", { class: "card card-compact" },
        el("h3", { class: "text-xl font-semibold mb-3" }, "Estado del Dispositivo"),
        el("ul", { class: "space-y-2" },
          el("li", { class: "flex justify-between" }, 
            el("span", { class: "font-medium" }, "Dispositivo:"), 
            el("span", {}, selectedDevice.nombre)
          ),
          el("li", { class: "flex justify-between" }, 
            el("span", { class: "font-medium" }, "Estado:"), 
            el("span", { class: `status-indicator ${selectedDevice.estado === 'activo' ? 'status-online' : 'status-offline'}` }, 
              el("span", { class: "status-dot" }),
              selectedDevice.estado
            )
          ),
          el("li", { class: "flex justify-between" }, 
            el("span", { class: "font-medium" }, "Última conexión:"), 
            el("span", { class: "text-sm" }, selectedDevice.ultima_conexion ? new Date(selectedDevice.ultima_conexion).toLocaleString() : 'N/A')
          )
        )
      ),
      rtChart
    );

    const actions = el("div", { class: "card" },
      el("h3", {}, "Acciones del Dispositivo"),
      el("p", { class: "muted" }, `Acciones específicas para ${selectedDevice.nombre} (solo admin/action).`),
      el("div", {},
        role === "readonly"
          ? el("div", { class: "muted" }, "Solo lectura: no hay acciones disponibles.")
          : el("div", { style: "display: flex; gap: 10px;" },
              el("button", { class: "btn" }, "Reiniciar Dispositivo"),
              el("button", { class: "btn" }, "Configurar Sensores"),
              el("button", { class: "btn" }, "Exportar Datos")
            )
      )
    );

    deviceSpecificCards = el("div", {},
      temperatureChart,
      grids,
      actions
    );
  } else {
    // Mensaje cuando no hay dispositivo seleccionado
    deviceSpecificCards = el("div", { class: "card" },
      el("div", {
        style: "text-align: center; padding: 40px; color: #666;"
      },
        el("h3", { style: "margin-bottom: 15px;" }, "Selecciona un Dispositivo"),
        el("p", { style: "margin-bottom: 20px;" }, "Usa el selector de arriba para elegir un dispositivo y ver sus datos específicos."),
        el("div", { style: "font-size: 0.9em; color: #888;" },
          "Una vez seleccionado, podrás ver:",
          el("ul", { style: "text-align: left; margin-top: 10px;" },
            el("li", {}, "Estadísticas detalladas del dispositivo"),
            el("li", {}, "Datos recientes de sensores"),
            el("li", {}, "Gráficos específicos del dispositivo"),
            el("li", {}, "Acciones disponibles para el dispositivo")
          )
        )
      )
    );
  }

  return el("div", {}, 
    header, 
    generalStatus,
    systemStatus,
    alertsWidget,
    deviceSelector, 
    deviceInfo, 
    deviceVisualization,
    deviceDataContainer,
    deviceSpecificCards,
    mqttLogs
  );
}
