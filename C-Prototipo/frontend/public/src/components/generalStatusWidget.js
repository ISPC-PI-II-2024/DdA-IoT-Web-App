// ==========================
// Widget de Estado General con indicadores LED por dispositivo
// ==========================
import { el } from "../utils/dom.js";
import { getState, setDevices } from "../state/store.js";
import { deviceService } from "../utils/deviceService.js";

export async function generalStatusWidget() {
  const { devices } = getState();
  
  // Cargar dispositivos si no están cargados (solo una vez)
  if (devices.length === 0) {
    try {
      await deviceService.getAllDevices();
    } catch (error) {
      console.error('Error cargando dispositivos:', error);
    }
  }

  const currentDevices = getState().devices;

  // Función para determinar el estado crítico de un dispositivo
  async function getDeviceCriticalStatus(device) {
    try {
      // Obtener datos recientes del dispositivo (últimos 10 registros)
      const sensorData = await deviceService.getDeviceSensorData(device.id_dispositivo, 10);
      
      if (!sensorData || sensorData.length === 0) {
        return {
          status: 'no_data',
          color: '#FF9800', // Naranja para sin datos
          message: 'Sin datos recientes'
        };
      }

      // Definir umbrales críticos para diferentes tipos de sensores
      const criticalThresholds = {
        'temperatura': { min: 0, max: 50 }, // °C
        'humedad': { min: 20, max: 80 }, // %
        'co2': { min: 300, max: 1000 }, // ppm
        'pm25': { min: 0, max: 25 }, // μg/m³
        'presion': { min: 900, max: 1100 }, // hPa
        'luminosidad': { min: 0, max: 10000 }, // lux
        'vibracion': { min: 0, max: 2 }, // g
        'sonido': { min: 0, max: 100 } // dB
      };

      let hasCriticalValues = false;
      let criticalSensors = [];

      // Verificar cada dato de sensor
      for (const data of sensorData) {
        const threshold = criticalThresholds[data.tipo_sensor];
        if (threshold) {
          const value = parseFloat(data.valor);
          if (value < threshold.min || value > threshold.max) {
            hasCriticalValues = true;
            criticalSensors.push({
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
          color: '#F44336', // Rojo para valores críticos
          message: `${criticalSensors.length} sensor(es) con valores críticos`,
          criticalSensors: criticalSensors
        };
      } else {
        return {
          status: 'normal',
          color: '#4CAF50', // Verde para valores normales
          message: 'Todos los sensores funcionando normalmente'
        };
      }
    } catch (error) {
      console.error('Error verificando estado crítico:', error);
      return {
        status: 'error',
        color: '#9E9E9E', // Gris para error
        message: 'Error verificando estado'
      };
    }
  }

  // Crear el contenedor principal
  const container = el("div", {
    class: "card",
    style: "margin-bottom: 20px;"
  });

  // Título del widget
  const title = el("h3", {
    style: "margin-bottom: 15px; display: flex; align-items: center; gap: 10px;"
  }, 
    el("span", {}, "Estado General de Dispositivos"),
    el("span", {
      id: "refresh-status-btn",
      style: "font-size: 0.8em; color: #666; cursor: pointer; padding: 5px 10px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;",
      title: "Actualizar estado"
    }, "🔄 Actualizar")
  );

  // Contenedor de dispositivos
  const devicesContainer = el("div", {
    id: "devices-status-container",
    style: "display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;"
  });

  // Función para actualizar el estado de todos los dispositivos
  async function updateDevicesStatus() {
    devicesContainer.innerHTML = "";
    
    // Mostrar indicador de carga
    const loadingDiv = el("div", {
      style: "text-align: center; padding: 20px; color: #666; grid-column: 1 / -1;"
    }, "Verificando estado de dispositivos...");
    devicesContainer.appendChild(loadingDiv);

    // Verificar estado de cada dispositivo
    const statusPromises = currentDevices.map(async (device) => {
      const criticalStatus = await getDeviceCriticalStatus(device);
      return { device, criticalStatus };
    });

    try {
      const deviceStatuses = await Promise.all(statusPromises);
      
      // Limpiar indicador de carga
      devicesContainer.innerHTML = "";

      // Crear cards para cada dispositivo
      deviceStatuses.forEach(({ device, criticalStatus }) => {
        const deviceCard = el("div", {
          style: `
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
          `,
          onmouseover: (e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          },
          onmouseout: (e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }
        });

        // LED indicator
        const ledIndicator = el("div", {
          style: `
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: ${criticalStatus.color};
            box-shadow: 0 0 8px ${criticalStatus.color}40;
            margin-right: 10px;
            animation: ${criticalStatus.status === 'critical' ? 'pulse 2s infinite' : 'none'};
          `
        });

        // Información del dispositivo
        const deviceInfo = el("div", {
          style: "flex: 1;"
        });

        const deviceName = el("div", {
          style: "font-weight: bold; margin-bottom: 5px;"
        }, device.nombre);

        const deviceId = el("div", {
          style: "font-size: 0.9em; color: #666; margin-bottom: 5px;"
        }, `ID: ${device.id_dispositivo}`);

        const deviceType = el("div", {
          style: "font-size: 0.8em; color: #888; margin-bottom: 8px;"
        }, `Tipo: ${device.tipo || 'N/A'}`);

        const statusMessage = el("div", {
          style: `
            font-size: 0.8em;
            color: ${criticalStatus.color};
            font-weight: ${criticalStatus.status === 'critical' ? 'bold' : 'normal'};
          `
        }, criticalStatus.message);

        // Detalles críticos si los hay
        let criticalDetails = null;
        if (criticalStatus.criticalSensors && criticalStatus.criticalSensors.length > 0) {
          criticalDetails = el("div", {
            style: "margin-top: 8px; font-size: 0.7em; color: #d32f2f;"
          });
          
          criticalStatus.criticalSensors.forEach(sensor => {
            const sensorDiv = el("div", {
              style: "margin-bottom: 2px;"
            }, `• ${sensor.sensor}: ${sensor.value}${sensor.unit} (límite: ${sensor.threshold.min}-${sensor.threshold.max}${sensor.unit})`);
            criticalDetails.appendChild(sensorDiv);
          });
        }

        // Estado de conexión
        const connectionStatus = el("div", {
          style: `
            font-size: 0.7em;
            color: ${device.estado === 'en_linea' ? '#4CAF50' : device.estado === 'fuera_linea' ? '#FF9800' : '#F44336'};
            margin-top: 5px;
          `
        }, `Conexión: ${device.estado}`);

        // Construir la card
        deviceInfo.appendChild(deviceName);
        deviceInfo.appendChild(deviceId);
        deviceInfo.appendChild(deviceType);
        deviceInfo.appendChild(statusMessage);
        if (criticalDetails) deviceInfo.appendChild(criticalDetails);
        deviceInfo.appendChild(connectionStatus);

        const cardContent = el("div", {
          style: "display: flex; align-items: flex-start;"
        }, ledIndicator, deviceInfo);

        deviceCard.appendChild(cardContent);
        devicesContainer.appendChild(deviceCard);
      });

    } catch (error) {
      console.error('Error actualizando estado de dispositivos:', error);
      devicesContainer.innerHTML = "";
      devicesContainer.appendChild(el("div", {
        style: "text-align: center; padding: 20px; color: #d32f2f; grid-column: 1 / -1;"
      }, "Error verificando estado de dispositivos"));
    }
  }

  // Event listener para el botón de actualizar
  title.querySelector('#refresh-status-btn').addEventListener('click', updateDevicesStatus);

  // Construir el widget
  container.appendChild(title);
  container.appendChild(devicesContainer);

  // Actualizar estado inicial
  await updateDevicesStatus();

  // Actualizar automáticamente cada 30 segundos
  const autoRefreshInterval = setInterval(updateDevicesStatus, 30000);

  // Limpiar intervalo cuando se destruya el componente
  container.addEventListener('destroy', () => {
    clearInterval(autoRefreshInterval);
  });

  return container;
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
