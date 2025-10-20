// ==========================
// Página de Vista General de Dispositivos
// Muestra todos los dispositivos con sus alarmas y permite navegar al dashboard
// ==========================
import { el } from "../utils/dom.js";
import { getState, setDevices, selectDevice } from "../state/store.js";
import { DevicesAPI } from "../api.js";
import { navigate } from "../router/index.js";

export async function render() {
  const { devices } = getState();
  
  // Cargar dispositivos si no están cargados
  if (devices.length === 0) {
    try {
      const response = await DevicesAPI.getAllDevices();
      if (response.success) {
        setDevices(response.data);
      }
    } catch (error) {
      console.error('Error cargando dispositivos:', error);
    }
  }

  const currentDevices = getState().devices;

  // Header de la página
  const header = el("div", { class: "card" },
    el("h2", {}, "Vista General de Dispositivos"),
    el("p", { class: "muted" }, "Monitoreo completo del estado de todos los dispositivos IoT del sistema")
  );

  // Función para determinar el estado crítico de un dispositivo
  async function getDeviceCriticalStatus(device) {
    try {
      const sensorData = await DevicesAPI.getDeviceSensorData(device.id_dispositivo, 10);
      
      if (!sensorData.success || sensorData.data.length === 0) {
        return {
          status: 'no_data',
          color: '#FF9800',
          message: 'Sin datos recientes',
          priority: 'medium'
        };
      }

      // Umbrales críticos para diferentes tipos de sensores
      const criticalThresholds = {
        'temperatura': { min: 0, max: 50 },
        'humedad': { min: 20, max: 80 },
        'co2': { min: 300, max: 1000 },
        'pm25': { min: 0, max: 25 },
        'presion': { min: 900, max: 1100 },
        'luminosidad': { min: 0, max: 10000 },
        'vibracion': { min: 0, max: 2 },
        'sonido': { min: 0, max: 100 }
      };

      let hasCriticalValues = false;
      let criticalSensors = [];
      let hasWarningValues = false;
      let warningSensors = [];

      // Verificar cada dato de sensor
      for (const data of sensorData.data) {
        const threshold = criticalThresholds[data.tipo_sensor];
        if (threshold) {
          const value = parseFloat(data.valor);
          const margin = (threshold.max - threshold.min) * 0.1; // 10% de margen para warning
          
          if (value < threshold.min || value > threshold.max) {
            hasCriticalValues = true;
            criticalSensors.push({
              sensor: data.tipo_sensor,
              value: value,
              unit: data.unidad,
              threshold: threshold
            });
          } else if (value < (threshold.min + margin) || value > (threshold.max - margin)) {
            hasWarningValues = true;
            warningSensors.push({
              sensor: data.tipo_sensor,
              value: value,
              unit: data.unidad,
              threshold: threshold
            });
          }
        }
      }

      if (hasCriticalValues) {
        return {
          status: 'critical',
          color: '#F44336',
          message: `${criticalSensors.length} sensor(es) crítico(s)`,
          priority: 'high',
          criticalSensors: criticalSensors
        };
      } else if (hasWarningValues) {
        return {
          status: 'warning',
          color: '#FF9800',
          message: `${warningSensors.length} sensor(es) en advertencia`,
          priority: 'medium',
          warningSensors: warningSensors
        };
      } else {
        return {
          status: 'normal',
          color: '#4CAF50',
          message: 'Todos los sensores funcionando normalmente',
          priority: 'low'
        };
      }
    } catch (error) {
      console.error('Error verificando estado crítico:', error);
      return {
        status: 'error',
        color: '#9E9E9E',
        message: 'Error verificando estado',
        priority: 'medium'
      };
    }
  }

  // Función para navegar al dashboard con dispositivo seleccionado
  function navigateToDashboard(device) {
    selectDevice(device);
    navigate('/dashboard');
  }

  // Contenedor principal de dispositivos
  const devicesContainer = el("div", {
    id: "devices-overview-container",
    style: "margin-top: 20px;"
  });

  // Función para actualizar la vista de dispositivos
  async function updateDevicesView() {
    devicesContainer.innerHTML = "";
    
    // Mostrar indicador de carga
    const loadingDiv = el("div", {
      style: "text-align: center; padding: 40px; color: #666;"
    }, 
      el("div", { style: "font-size: 1.2em; margin-bottom: 10px;" }, "🔄"),
      el("div", {}, "Analizando estado de dispositivos...")
    );
    devicesContainer.appendChild(loadingDiv);

    // Verificar estado de cada dispositivo
    const statusPromises = currentDevices.map(async (device) => {
      const criticalStatus = await getDeviceCriticalStatus(device);
      return { device, criticalStatus };
    });

    try {
      const deviceStatuses = await Promise.all(statusPromises);
      
      // Ordenar por prioridad (crítico > advertencia > normal > error)
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      deviceStatuses.sort((a, b) => priorityOrder[a.criticalStatus.priority] - priorityOrder[b.criticalStatus.priority]);

      // Limpiar indicador de carga
      devicesContainer.innerHTML = "";

      // Crear grid de dispositivos
      const devicesGrid = el("div", {
        style: "display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;"
      });

      // Estadísticas generales
      const stats = {
        total: deviceStatuses.length,
        critical: deviceStatuses.filter(d => d.criticalStatus.priority === 'high').length,
        warning: deviceStatuses.filter(d => d.criticalStatus.priority === 'medium').length,
        normal: deviceStatuses.filter(d => d.criticalStatus.priority === 'low').length
      };

      const statsCard = el("div", {
        class: "card",
        style: "grid-column: 1 / -1; margin-bottom: 20px;"
      },
        el("h3", { style: "margin-bottom: 15px;" }, "Resumen del Sistema"),
        el("div", {
          style: "display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;"
        },
          el("div", {
            style: "text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px;"
          },
            el("div", { style: "font-size: 2em; font-weight: bold; color: #333;" }, stats.total),
            el("div", { style: "color: #666;" }, "Total Dispositivos")
          ),
          el("div", {
            style: "text-align: center; padding: 15px; background: #ffebee; border-radius: 8px;"
          },
            el("div", { style: "font-size: 2em; font-weight: bold; color: #d32f2f;" }, stats.critical),
            el("div", { style: "color: #666;" }, "Críticos")
          ),
          el("div", {
            style: "text-align: center; padding: 15px; background: #fff3e0; border-radius: 8px;"
          },
            el("div", { style: "font-size: 2em; font-weight: bold; color: #f57c00;" }, stats.warning),
            el("div", { style: "color: #666;" }, "Advertencias")
          ),
          el("div", {
            style: "text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px;"
          },
            el("div", { style: "font-size: 2em; font-weight: bold; color: #2e7d32;" }, stats.normal),
            el("div", { style: "color: #666;" }, "Normales")
          )
        )
      );

      devicesGrid.appendChild(statsCard);

      // Crear cards para cada dispositivo
      deviceStatuses.forEach(({ device, criticalStatus }) => {
        const deviceCard = el("div", {
          style: `
            border: 2px solid ${criticalStatus.color};
            border-radius: 12px;
            padding: 20px;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
          `,
          onclick: () => navigateToDashboard(device),
          onmouseover: (e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
          },
          onmouseout: (e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }
        });

        // Indicador de prioridad
        const priorityIndicator = el("div", {
          style: `
            position: absolute;
            top: -8px;
            right: -8px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: ${criticalStatus.color};
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            animation: ${criticalStatus.priority === 'high' ? 'pulse 2s infinite' : 'none'};
          `
        });

        // LED principal
        const ledIndicator = el("div", {
          style: `
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: ${criticalStatus.color};
            box-shadow: 0 0 12px ${criticalStatus.color}60;
            margin-right: 15px;
            flex-shrink: 0;
          `
        });

        // Información del dispositivo
        const deviceInfo = el("div", {
          style: "flex: 1;"
        });

        const deviceName = el("div", {
          style: "font-weight: bold; font-size: 1.1em; margin-bottom: 8px; color: #333;"
        }, device.nombre);

        const deviceId = el("div", {
          style: "font-size: 0.9em; color: #666; margin-bottom: 5px;"
        }, `ID: ${device.id_dispositivo}`);

        const deviceType = el("div", {
          style: "font-size: 0.8em; color: #888; margin-bottom: 10px;"
        }, `Tipo: ${device.tipo || 'N/A'}`);

        const deviceLocation = el("div", {
          style: "font-size: 0.8em; color: #888; margin-bottom: 10px;"
        }, `📍 ${device.ubicacion || 'Ubicación no especificada'}`);

        const statusMessage = el("div", {
          style: `
            font-size: 0.9em;
            color: ${criticalStatus.color};
            font-weight: ${criticalStatus.priority === 'high' ? 'bold' : 'normal'};
            margin-bottom: 10px;
          `
        }, criticalStatus.message);

        // Estado de conexión
        const connectionStatus = el("div", {
          style: `
            font-size: 0.8em;
            color: ${device.estado === 'en_linea' ? '#4CAF50' : device.estado === 'fuera_linea' ? '#FF9800' : '#F44336'};
            margin-bottom: 10px;
          `
        }, `🔗 Conexión: ${device.estado}`);

        // Detalles críticos si los hay
        let criticalDetails = null;
        if (criticalStatus.criticalSensors && criticalStatus.criticalSensors.length > 0) {
          criticalDetails = el("div", {
            style: "margin-top: 10px; font-size: 0.7em; color: #d32f2f; background: #ffebee; padding: 8px; border-radius: 4px;"
          });
          
          criticalDetails.appendChild(el("div", { style: "font-weight: bold; margin-bottom: 5px;" }, "⚠️ Sensores Críticos:"));
          criticalStatus.criticalSensors.forEach(sensor => {
            const sensorDiv = el("div", {
              style: "margin-bottom: 2px;"
            }, `• ${sensor.sensor}: ${sensor.value}${sensor.unit} (límite: ${sensor.threshold.min}-${sensor.threshold.max}${sensor.unit})`);
            criticalDetails.appendChild(sensorDiv);
          });
        }

        // Detalles de advertencia si los hay
        let warningDetails = null;
        if (criticalStatus.warningSensors && criticalStatus.warningSensors.length > 0) {
          warningDetails = el("div", {
            style: "margin-top: 10px; font-size: 0.7em; color: #f57c00; background: #fff3e0; padding: 8px; border-radius: 4px;"
          });
          
          warningDetails.appendChild(el("div", { style: "font-weight: bold; margin-bottom: 5px;" }, "⚠️ Sensores en Advertencia:"));
          criticalStatus.warningSensors.forEach(sensor => {
            const sensorDiv = el("div", {
              style: "margin-bottom: 2px;"
            }, `• ${sensor.sensor}: ${sensor.value}${sensor.unit}`);
            warningDetails.appendChild(sensorDiv);
          });
        }

        // Botón de acción
        const actionButton = el("div", {
          style: `
            margin-top: 15px;
            padding: 8px 16px;
            background: ${criticalStatus.color};
            color: white;
            border-radius: 6px;
            font-size: 0.8em;
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            transition: background-color 0.2s;
          `,
          onmouseover: (e) => {
            e.target.style.opacity = '0.8';
          },
          onmouseout: (e) => {
            e.target.style.opacity = '1';
          }
        }, "Ver Detalles →");

        // Construir la card
        deviceInfo.appendChild(deviceName);
        deviceInfo.appendChild(deviceId);
        deviceInfo.appendChild(deviceType);
        deviceInfo.appendChild(deviceLocation);
        deviceInfo.appendChild(statusMessage);
        deviceInfo.appendChild(connectionStatus);
        if (criticalDetails) deviceInfo.appendChild(criticalDetails);
        if (warningDetails) deviceInfo.appendChild(warningDetails);
        deviceInfo.appendChild(actionButton);

        const cardContent = el("div", {
          style: "display: flex; align-items: flex-start;"
        }, ledIndicator, deviceInfo);

        deviceCard.appendChild(priorityIndicator);
        deviceCard.appendChild(cardContent);
        devicesGrid.appendChild(deviceCard);
      });

      devicesContainer.appendChild(devicesGrid);

    } catch (error) {
      console.error('Error actualizando vista de dispositivos:', error);
      devicesContainer.innerHTML = "";
      devicesContainer.appendChild(el("div", {
        style: "text-align: center; padding: 40px; color: #d32f2f;"
      }, 
        el("div", { style: "font-size: 1.2em; margin-bottom: 10px;" }, "❌"),
        el("div", {}, "Error cargando dispositivos: " + error.message)
      ));
    }
  }

  // Botón de actualización
  const refreshButton = el("button", {
    class: "btn",
    style: "margin-bottom: 20px;",
    onclick: updateDevicesView
  }, "🔄 Actualizar Vista");

  // Construir la página
  const page = el("div", {},
    header,
    refreshButton,
    devicesContainer
  );

  // Actualizar vista inicial
  await updateDevicesView();

  return page;
}

// Agregar estilos CSS para la animación de pulso
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(style);
