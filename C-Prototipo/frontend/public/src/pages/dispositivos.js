// ==========================
// Página de Vista General de Dispositivos
// Muestra la estructura jerárquica: Gateway -> Endpoints -> Sensores
// Solo datos de la DB, sin MQTT
// ==========================
import { el } from "../utils/dom.js";
import { setDevices } from "../state/store.js";
import { DevicesAPI, GatewayAPI } from "../api.js";

export async function render() {
  let lastUpdate = null;
  let devicesData = null;
  
  // Función para cargar dispositivos de la DB
  async function loadDevicesFromDB() {
    try {
      const response = await DevicesAPI.getAllDevices();
      if (response.success && Array.isArray(response.data)) {
        devicesData = response.data;
        lastUpdate = new Date();
        return devicesData;
      } else {
        console.warn('No se pudieron cargar los dispositivos:', response);
        return [];
      }
    } catch (error) {
      console.error('Error cargando dispositivos:', error);
      return [];
    }
  }

  // Fallback: cargar dispositivos desde el estado del sistema (MQTT) si DB está vacía
  async function loadDevicesFromSystemStatus() {
    try {
      const response = await GatewayAPI.getSystemStatus();
      if (response && response.success && response.data) {
        const { gateways = [], endpoints = [], sensors = [] } = response.data;
        const devices = [];
        gateways.forEach(g => devices.push({
          id: g.id,
          id_dispositivo: g.id,
          nombre: `Gateway ${g.id}`,
          tipo: 'gateway',
          ubicacion: g.ubicacion || null,
          estado: g.lora_status === 'ok' ? 'en_linea' : 'fuera_linea',
          id_gateway: g.id,
          id_endpoint: null
        }));
        endpoints.forEach(e => devices.push({
          id: e.id,
          id_dispositivo: e.id,
          nombre: `Endpoint ${e.id}`,
          tipo: 'endpoint',
          ubicacion: null,
          estado: e.status === 'ok' ? 'en_linea' : (e.status === 'battery_low' ? 'error' : 'fuera_linea'),
          id_gateway: e.gateway_id,
          id_endpoint: null
        }));
        sensors.forEach(s => devices.push({
          id: s.id,
          id_dispositivo: s.id,
          nombre: `Sensor ${s.id}`,
          tipo: 'sensor',
          ubicacion: null,
          estado: s.status === 'ok' ? 'en_linea' : 'error',
          id_gateway: s.gateway_id,
          id_endpoint: s.endpoint_id
        }));
        return devices;
      }
    } catch (e) {
      console.warn('[DISPOSITIVOS] Fallback system status error:', e);
    }
    return [];
  }

  // Cargar histórico para un dispositivo (MariaDB + InfluxDB)
  async function renderHistoryForDevice(deviceId, containerNode) {
    try {
      // Contenedor de histórico
      let history = containerNode.querySelector?.('.device-history');
      if (!history) {
        history = el('div', { class: 'device-history', style: 'margin-top:10px; background:#fff; border:1px solid #eee; border-radius:6px; padding:10px;' });
        containerNode.appendChild(history);
      }
      history.innerHTML = '<div style="text-align:center; padding:10px; color:#666;">Cargando histórico...</div>';

      // Cargar datos de sensores desde MariaDB
      const mdb = await DevicesAPI.getDeviceSensorData(deviceId, 20).catch(() => ({ success:false, data:[] }));
      const rows = (mdb && mdb.success && Array.isArray(mdb.data)) ? mdb.data : [];

      // Cargar datos históricos desde InfluxDB
      const influxData = await DevicesAPI.getHistoricalData(deviceId, 50, "24h").catch(() => ({ success:false, data:[] }));
      const influxRows = (influxData && influxData.success && Array.isArray(influxData.data)) ? influxData.data : [];

      history.innerHTML = '';

      // Tab de selección (MariaDB vs InfluxDB)
      const tabs = el('div', { style: 'display:flex; gap:8px; margin-bottom:10px; border-bottom:2px solid #e0e0e0;' });
      let activeTab = 'mariadb';
      
      const mariadbTab = el('button', {
        class: 'btn btn-sm',
        style: `padding: 8px 16px; border: none; border-bottom: 2px solid ${activeTab === 'mariadb' ? '#2196F3' : 'transparent'}; background: none; cursor: pointer; color: ${activeTab === 'mariadb' ? '#2196F3' : '#666'}; font-weight: ${activeTab === 'mariadb' ? 'bold' : 'normal'};`,
        onclick: () => {
          activeTab = 'mariadb';
          mariadbTab.style.color = '#2196F3';
          mariadbTab.style.fontWeight = 'bold';
          mariadbTab.style.borderBottomColor = '#2196F3';
          influxdbTab.style.color = '#666';
          influxdbTab.style.fontWeight = 'normal';
          influxdbTab.style.borderBottomColor = 'transparent';
          showTabContent('mariadb');
        }
      }, `📊 MariaDB (${rows.length})`);
      
      const influxdbTab = el('button', {
        class: 'btn btn-sm',
        style: `padding: 8px 16px; border: none; border-bottom: 2px solid ${activeTab === 'influxdb' ? '#9C27B0' : 'transparent'}; background: none; cursor: pointer; color: ${activeTab === 'influxdb' ? '#9C27B0' : '#666'}; font-weight: ${activeTab === 'influxdb' ? 'bold' : 'normal'};`,
        onclick: () => {
          activeTab = 'influxdb';
          influxdbTab.style.color = '#9C27B0';
          influxdbTab.style.fontWeight = 'bold';
          influxdbTab.style.borderBottomColor = '#9C27B0';
          mariadbTab.style.color = '#666';
          mariadbTab.style.fontWeight = 'normal';
          mariadbTab.style.borderBottomColor = 'transparent';
          showTabContent('influxdb');
        }
      }, `⚡ InfluxDB (${influxRows.length})`);

      tabs.appendChild(mariadbTab);
      tabs.appendChild(influxdbTab);

      // Contenedor de contenido de tabs
      const tabContent = el('div', { id: 'tab-content' });

      // Contenido MariaDB
      const mariadbContent = rows.length > 0 ? el('div', { class: 'tab-content-item', style: 'display:none;' },
        el('div', { style: 'margin-bottom:8px; font-size:12px; color:#666;' }, `📊 Últimos ${rows.length} registros de sensores`),
        el('div', { style: 'overflow-x:auto; max-height:300px;' },
          el('table', { style: 'width:100%; border-collapse:collapse; font-size:0.85em;' },
            el('thead', { style: 'position:sticky; top:0; background:#f9f9f9; z-index:1;' },
              el('tr', {},
                el('th', { style: 'padding:8px; border:1px solid #ddd; text-align:left;' }, 'Tipo Sensor'),
                el('th', { style: 'padding:8px; border:1px solid #ddd; text-align:left;' }, 'Valor'),
                el('th', { style: 'padding:8px; border:1px solid #ddd; text-align:left;' }, 'Unidad'),
                el('th', { style: 'padding:8px; border:1px solid #ddd; text-align:left;' }, 'Timestamp')
              )
            ),
            el('tbody', {},
              ...rows.map(r => el('tr', {},
                el('td', { style: 'padding:6px; border:1px solid #f0f0f0;' }, r.tipo_sensor || '—'),
                el('td', { style: 'padding:6px; border:1px solid #f0f0f0;' }, String(r.valor ?? '—')),
                el('td', { style: 'padding:6px; border:1px solid #f0f0f0;' }, r.unidad || '—'),
                el('td', { style: 'padding:6px; border:1px solid #f0f0f0;' }, r.timestamp ? new Date(r.timestamp).toLocaleString() : '—')
              ))
            )
          )
        )
      ) : el('div', { class: 'tab-content-item', style: 'display:none; text-align:center; padding:20px; color:#999;' }, 'No hay datos históricos en MariaDB');

      // Contenido InfluxDB
      const influxdbContent = influxRows.length > 0 ? el('div', { class: 'tab-content-item', style: 'display:none;' },
        el('div', { style: 'margin-bottom:8px; font-size:12px; color:#666;' }, `⚡ Últimos ${influxRows.length} mensajes MQTT (últimas 24h)`),
        el('div', { style: 'overflow-x:auto; max-height:300px;' },
          el('table', { style: 'width:100%; border-collapse:collapse; font-size:0.85em;' },
            el('thead', { style: 'position:sticky; top:0; background:#f9f9f9; z-index:1;' },
              el('tr', {},
                el('th', { style: 'padding:8px; border:1px solid #ddd; text-align:left;' }, 'Timestamp'),
                el('th', { style: 'padding:8px; border:1px solid #ddd; text-align:left;' }, 'Tópico'),
                el('th', { style: 'padding:8px; border:1px solid #ddd; text-align:left;' }, 'Datos')
              )
            ),
            el('tbody', {},
              ...influxRows.map(r => el('tr', {},
                el('td', { style: 'padding:6px; border:1px solid #f0f0f0;' }, r.timestamp ? new Date(r.timestamp).toLocaleString() : '—'),
                el('td', { style: 'padding:6px; border:1px solid #f0f0f0;' }, r.topic || '—'),
                el('td', { style: 'padding:6px; border:1px solid #f0f0f0; max-width:300px; overflow:hidden; text-overflow:ellipsis;' }, JSON.stringify(Object.keys(r).filter(k => !['timestamp', 'topic', 'host'].includes(k)).reduce((obj, k) => { obj[k] = r[k]; return obj; }, {})).substring(0, 100) + '...')
              ))
            )
          )
        )
      ) : el('div', { class: 'tab-content-item', style: 'display:none; text-align:center; padding:20px; color:#999;' }, 'No hay datos históricos en InfluxDB');

      tabContent.appendChild(mariadbContent);
      tabContent.appendChild(influxdbContent);

      // Función para mostrar contenido del tab
      function showTabContent(tab) {
        Array.from(tabContent.querySelectorAll('.tab-content-item')).forEach(item => {
          item.style.display = 'none';
        });
        if (tab === 'mariadb') mariadbContent.style.display = 'block';
        else influxdbContent.style.display = 'block';
      }

      history.appendChild(tabs);
      history.appendChild(tabContent);

      // Mostrar tab inicial
      showTabContent('mariadb');
    } catch (err) {
      console.error('[DISPOSITIVOS] Error renderizando histórico:', err);
      try {
        if (history) history.innerHTML = '<div style="margin-top:8px; color:#d32f2f;">Error cargando histórico: ' + err.message + '</div>';
      } catch {}
    }
  }


  // Cargar dispositivos inicialmente
  let currentDevices = await loadDevicesFromDB();

  // Header de la página
  const header = el("div", { class: "card card-feature" },
    el("h2", { class: "text-2xl font-bold mb-2" }, "Vista General de Dispositivos"),
    el("p", { class: "muted text-lg" }, "Monitoreo completo del estado de todos los dispositivos IoT del sistema")
  );

  // Función para organizar dispositivos jerárquicamente
  function organizeDevicesHierarchy(devices) {
    const gateways = [];
    const endpointsByGateway = {};
    const sensorsByEndpoint = {};
    
    console.log('[DISPOSITIVOS] Organizando', devices.length, 'dispositivos');
    
    // Separar dispositivos por tipo
    devices.forEach(device => {
      if (device.tipo === 'gateway') {
        gateways.push(device);
        console.log('[DISPOSITIVOS] Gateway encontrado:', device.id_dispositivo);
      } else if (device.tipo === 'endpoint') {
        const gatewayId = device.id_gateway || 'unknown';
        if (!endpointsByGateway[gatewayId]) {
          endpointsByGateway[gatewayId] = [];
        }
        endpointsByGateway[gatewayId].push(device);
        console.log('[DISPOSITIVOS] Endpoint encontrado:', device.id_dispositivo, 'para gateway:', gatewayId);
      } else if (device.tipo === 'sensor') {
        const endpointId = device.id_endpoint || 'unknown';
        if (!sensorsByEndpoint[endpointId]) {
          sensorsByEndpoint[endpointId] = [];
        }
        sensorsByEndpoint[endpointId].push(device);
        console.log('[DISPOSITIVOS] Sensor encontrado:', device.id_dispositivo, 'para endpoint:', endpointId);
      } else {
        console.log('[DISPOSITIVOS] Dispositivo desconocido:', device.tipo, device.id_dispositivo);
      }
    });
    
    console.log('[DISPOSITIVOS] Resultado:', {
      gateways: gateways.length,
      endpoints: Object.keys(endpointsByGateway).length,
      sensors: Object.keys(sensorsByEndpoint).length
    });
    
    return { gateways, endpointsByGateway, sensorsByEndpoint };
  }
  
  // Función para obtener estado del dispositivo
  function getDeviceStatusColor(device) {
    if (device.estado === 'en_linea') return '#4CAF50';
    if (device.estado === 'fuera_linea') return '#FF9800';
    return '#F44336';
  }
  


  // Contenedor principal de dispositivos
  const devicesContainer = el("div", {
    id: "devices-overview-container",
    style: "margin-top: 20px;"
  });

  // Función para actualizar la vista de dispositivos
  async function updateDevicesView() {
    devicesContainer.innerHTML = "";
    
    // Recargar dispositivos si es necesario (cada 10 minutos o manual)
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60000);
    
    if (!lastUpdate || lastUpdate < tenMinutesAgo) {
      currentDevices = await loadDevicesFromDB();
    }
    
    // Verificar si hay dispositivos
    let validDevices = Array.isArray(currentDevices) && currentDevices.length > 0 ? currentDevices : [];

    // Fallback si no hay en DB
    if (validDevices.length === 0) {
      const fallback = await loadDevicesFromSystemStatus();
      if (fallback.length > 0) {
        validDevices = fallback;
      }
    }

    if (validDevices.length === 0) {
      // Mostrar mensaje cuando no hay dispositivos
      const noDevicesMessage = el("div", { class: "card" },
        el("div", {
          style: "text-align: center; padding: 60px; color: #666;"
        },
          el("div", { style: "font-size: 3em; margin-bottom: 20px;" }, "📱"),
          el("h3", { style: "margin-bottom: 15px; font-size: 1.5em;" }, "No hay dispositivos disponibles"),
          el("p", { style: "margin-bottom: 30px; color: #888;" }, 
            "La base de datos no contiene dispositivos IoT registrados. " +
            "Verifica que los scripts de inicialización se hayan ejecutado correctamente."
          ),
          el("button", {
            class: "btn btn-primary",
            onclick: async () => {
              try {
                const response = await DevicesAPI.getAllDevices();
                if (response.success && Array.isArray(response.data) && response.data.length > 0) {
                  setDevices(response.data);
                  location.reload();
                }
              } catch (error) {
                console.error('Error recargando dispositivos:', error);
                alert('Error al recargar dispositivos: ' + error.message);
              }
            }
          }, "🔄 Intentar Cargar Dispositivos")
        )
      );
      devicesContainer.appendChild(noDevicesMessage);
      return;
    }
    
    // Mostrar indicador de carga
    const loadingDiv = el("div", {
      style: "text-align: center; padding: 40px; color: #666;"
    }, 
      el("div", { style: "font-size: 1.2em; margin-bottom: 10px;" }, "🔄"),
      el("div", {}, "Analizando estado de dispositivos...")
    );
    devicesContainer.appendChild(loadingDiv);

      try {
        // Organizar dispositivos jerárquicamente
        const { gateways, endpointsByGateway, sensorsByEndpoint } = organizeDevicesHierarchy(validDevices);

      // Limpiar indicador de carga
      devicesContainer.innerHTML = "";

        // Crear container principal
        const mainContainer = el("div", {
          style: "display: flex; flex-direction: column; gap: 20px;"
      });

      // Estadísticas generales
      const stats = {
          totalGateways: gateways.length,
          totalEndpoints: Object.values(endpointsByGateway).flat().length,
          totalSensors: Object.values(sensorsByEndpoint).flat().length,
          totalOnline: validDevices.filter(d => d.estado === 'en_linea').length,
          totalOffline: validDevices.filter(d => d.estado === 'fuera_linea').length
        };

        // Crear card de estadísticas
        const statsCard = el("div", { class: "card" },
          el("h3", { style: "margin-bottom: 15px;" }, "📊 Resumen del Sistema"),
        el("div", {
          style: "display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;"
        },
          el("div", {
              style: "text-align: center; padding: 15px; background: #e3f2fd; border-radius: 8px; border: 2px solid #2196F3;"
            },
              el("div", { style: "font-size: 2em; font-weight: bold; color: #1976D2;" }, stats.totalGateways),
              el("div", { style: "color: #666;" }, "Gateways")
            ),
            el("div", {
              style: "text-align: center; padding: 15px; background: #f3e5f5; border-radius: 8px; border: 2px solid #9c27b0;"
            },
              el("div", { style: "font-size: 2em; font-weight: bold; color: #7b1fa2;" }, stats.totalEndpoints),
              el("div", { style: "color: #666;" }, "Endpoints")
          ),
          el("div", {
              style: "text-align: center; padding: 15px; background: #fff3e0; border-radius: 8px; border: 2px solid #ff9800;"
          },
              el("div", { style: "font-size: 2em; font-weight: bold; color: #e65100;" }, stats.totalSensors),
              el("div", { style: "color: #666;" }, "Sensores")
          ),
          el("div", {
              style: "text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; border: 2px solid #4caf50;"
          },
              el("div", { style: "font-size: 2em; font-weight: bold; color: #2e7d32;" }, stats.totalOnline),
              el("div", { style: "color: #666;" }, "En Línea")
          ),
          el("div", {
              style: "text-align: center; padding: 15px; background: #fff3e0; border-radius: 8px; border: 2px solid #ff9800;"
            },
              el("div", { style: "font-size: 2em; font-weight: bold; color: #f57c00;" }, stats.totalOffline),
              el("div", { style: "color: #666;" }, "Fuera de Línea")
            )
          )
        );

        mainContainer.appendChild(statsCard);

        // Crear estructura jerárquica
        gateways.forEach(gateway => {
          const gatewayColor = getDeviceStatusColor(gateway);
          const gatewayCard = el("div", { class: "card", style: "border-left: 4px solid " + gatewayColor },
            el("div", { style: "display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;" },
              el("div", {},
                el("h3", { style: "margin: 0; color: #333; display: flex; align-items: center; gap: 10px;" },
                  el("span", { style: `width: 12px; height: 12px; border-radius: 50%; background-color: ${gatewayColor}; box-shadow: 0 0 8px ${gatewayColor}40;` }),
                  `Gateway ${gateway.id_dispositivo}`,
                  el("span", { style: "font-size: 0.7em; color: #666; font-weight: normal;" }, `(${gateway.nombre})`)
                ),
                el("p", { style: "margin: 5px 0 0 0; color: #666; font-size: 0.9em;" }, `📍 ${gateway.ubicacion || 'Sin ubicación'}`)
              ),
              el("div", { style: "padding: 5px 15px; border-radius: 20px; background: " + gatewayColor + "20; color: " + gatewayColor + "; font-weight: bold; font-size: 0.8em;" }, 
                gateway.estado === 'en_linea' ? 'En Línea' : gateway.estado === 'fuera_linea' ? 'Fuera de Línea' : 'Error'
              )
            )
          );

          const endpoints = endpointsByGateway[gateway.id_dispositivo] || [];
          if (endpoints.length > 0) {
            const endpointsContainer = el("div", { style: "margin-top: 15px; padding-left: 20px; border-left: 2px solid #e0e0e0;" });
            
            endpoints.forEach(endpoint => {
              const endpointColor = getDeviceStatusColor(endpoint);
              const endpointCard = el("div", { 
                class: "card",
                style: "margin-bottom: 15px; padding: 15px; border-left: 3px solid " + endpointColor + "; background: #fafafa;"
              },
                el("div", { style: "display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;" },
                  el("div", {},
                    el("h4", { style: "margin: 0; color: #333; display: flex; align-items: center; gap: 8px;" },
                      el("span", { style: `width: 10px; height: 10px; border-radius: 50%; background-color: ${endpointColor};` }),
                      `Endpoint ${endpoint.id_dispositivo}`,
                      el("span", { style: "font-size: 0.75em; color: #666; font-weight: normal;" }, `(${endpoint.nombre})`)
                    ),
                    el("p", { style: "margin: 5px 0 0 0; color: #666; font-size: 0.85em;" }, `📍 ${endpoint.ubicacion || 'Sin ubicación'}`)
                  ),
                  el("div", { style: "padding: 3px 10px; border-radius: 15px; background: " + endpointColor + "20; color: " + endpointColor + "; font-weight: bold; font-size: 0.75em;" }, 
                    endpoint.estado === 'en_linea' ? 'En Línea' : 'Fuera de Línea'
                  )
                )
              );

              // Acción: ver histórico del endpoint
              try {
                endpointCard.appendChild(el('div', { style: 'margin-top:6px;' },
                  el('button', {
                    class: 'btn btn-sm',
                    onclick: async () => { await renderHistoryForDevice(endpoint.id_dispositivo, endpointCard); }
                  }, '📈 Ver Histórico')
                ));
              } catch {}

              const sensors = sensorsByEndpoint[endpoint.id_dispositivo] || [];
              if (sensors.length > 0) {
                try {
                  const sensorsList = el("div", { style: "margin-top: 10px; padding-left: 15px; border-left: 2px solid #e8e8e8;" });
                  
                  sensors.forEach(sensor => {
                    try {
                      const sensorColor = getDeviceStatusColor(sensor);
                      const sensorName = (sensor.nombre ? String(sensor.nombre) : `Sensor ${sensor.id_dispositivo || 'unknown'}`).trim();
                      const sensorItem = el("div", {
                        style: `padding: 8px 12px; margin-bottom: 5px; background: white; border-left: 2px solid ${sensorColor}; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;`
                      },
                        el("div", { style: "display: flex; align-items: center; gap: 8px; font-size: 0.9em; color: #555;" },
                          el("span", { style: `width: 8px; height: 8px; border-radius: 50%; background-color: ${sensorColor};` }),
                          sensorName
                        ),
                        el('div', { style: 'display:flex; align-items:center; gap:8px;' },
                          el("span", { style: "padding: 3px 8px; border-radius: 12px; background: " + sensorColor + "20; color: " + sensorColor + "; font-weight: bold; font-size: 0.75em;" },
                            sensor.estado === 'en_linea' ? '●' : '○'
                          ),
                          el('button', { class: 'btn btn-xs', onclick: async () => { await renderHistoryForDevice(sensor.id_dispositivo, sensorItem); } }, '📈 Histórico')
                        )
                      );
                      
                      if (sensorsList && sensorItem instanceof Node) {
                        sensorsList.appendChild(sensorItem);
                      }
                    } catch (sensorError) {
                      console.error('Error creating sensor item:', sensorError, {
                        sensor,
                        sensorId: sensor.id_dispositivo
                      });
                    }
                  });
                  
                  if (endpointCard && sensorsList instanceof Node && sensorsList.children.length > 0) {
                    endpointCard.appendChild(sensorsList);
                  }
                } catch (sensorsListError) {
                  console.error('Error creating sensors list:', sensorsListError);
                }
              }
              
              try {
                if (endpointsContainer && endpointCard instanceof Node) {
                  endpointsContainer.appendChild(endpointCard);
                }
              } catch (endpointAppendError) {
                console.error('Error appending endpoint card:', endpointAppendError);
              }
            });
            
            try {
              if (gatewayCard && endpointsContainer instanceof Node && endpointsContainer.children.length > 0) {
                gatewayCard.appendChild(endpointsContainer);
              }
            } catch (gatewayAppendError) {
              console.error('Error appending endpoints container:', gatewayAppendError);
            }
          }
          
          try {
            if (mainContainer && gatewayCard instanceof Node) {
              mainContainer.appendChild(gatewayCard);
            }
          } catch (mainAppendError) {
            console.error('Error appending gateway card:', mainAppendError);
          }
        });

        devicesContainer.appendChild(mainContainer);

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
    onclick: async () => {
      currentDevices = await loadDevicesFromDB();
      await updateDevicesView();
    }
  }, "🔄 Actualizar Vista");

  // Agregar indicador de última actualización
  const lastUpdateIndicator = el("div", {
    id: "last-update-indicator",
    style: "font-size: 0.85em; color: #666; margin-bottom: 15px; padding: 8px; background: #f5f5f5; border-radius: 4px;"
  }, "Última actualización: Cargando...");

  // Función para actualizar el indicador
  function updateLastUpdateIndicator() {
    if (lastUpdate) {
      const timeStr = lastUpdate.toLocaleTimeString();
      lastUpdateIndicator.textContent = `Última actualización: ${timeStr}`;
    }
  }

  // Actualizar indicador
  updateLastUpdateIndicator();

  // Auto-refresh cada 10 minutos
  const autoRefreshInterval = setInterval(async () => {
    currentDevices = await loadDevicesFromDB();
    await updateDevicesView();
    updateLastUpdateIndicator();
  }, 10 * 60 * 1000); // 10 minutos

  // Limpiar intervalo al salir
  window.addEventListener('beforeunload', () => {
    clearInterval(autoRefreshInterval);
  });

  // Construir la página
  const page = el("div", {},
    header,
    refreshButton,
    lastUpdateIndicator,
    devicesContainer
  );

  // Actualizar vista inicial
  await updateDevicesView();
  updateLastUpdateIndicator();

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
