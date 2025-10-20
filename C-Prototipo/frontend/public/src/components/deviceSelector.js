// ==========================
// Componente de selección de dispositivos con buscador
// ==========================
import { el } from "../utils/dom.js";
import { getState, setDevices, selectDevice } from "../state/store.js";
import { DevicesAPI } from "../api.js";

export async function deviceSelectorWidget() {
  const { devices, selectedDevice } = getState();
  
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

  // Crear el input de búsqueda
  const searchInput = el("input", {
    type: "text",
    placeholder: "Buscar dispositivo por nombre o ID...",
    class: "device-search-input",
    style: "width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px;"
  });

  // Crear el contenedor de resultados
  const resultsContainer = el("div", {
    class: "device-results",
    style: "max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; background: white;"
  });

  // Crear el contenedor principal
  const container = el("div", {
    class: "device-selector",
    style: "position: relative; width: 100%;"
  }, searchInput, resultsContainer);

  // Función para filtrar dispositivos
  function filterDevices(searchTerm) {
    const filtered = currentDevices.filter(device => 
      device.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id_dispositivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Limpiar resultados anteriores
    resultsContainer.innerHTML = "";

    if (filtered.length === 0) {
      resultsContainer.appendChild(el("div", {
        style: "padding: 10px; color: #666; text-align: center;"
      }, "No se encontraron dispositivos"));
      return;
    }

    // Crear elementos para cada dispositivo filtrado
    filtered.forEach(device => {
      const deviceElement = el("div", {
        class: "device-option",
        style: `
          padding: 10px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s;
        `,
        onmouseover: (e) => e.target.style.backgroundColor = "#f5f5f5",
        onmouseout: (e) => e.target.style.backgroundColor = "white",
        onclick: () => {
          selectDevice(device);
          resultsContainer.style.display = "none";
          searchInput.value = device.nombre;
          // Disparar evento personalizado para notificar la selección
          container.dispatchEvent(new CustomEvent('deviceSelected', { 
            detail: { device } 
          }));
        }
      });

      // Estado visual del dispositivo
      const statusColor = device.estado === 'en_linea' ? '#4CAF50' : 
                         device.estado === 'fuera_linea' ? '#FF9800' : '#F44336';
      
      deviceElement.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${device.nombre}</strong>
            <div style="font-size: 0.9em; color: #666;">
              ID: ${device.id_dispositivo} | Tipo: ${device.tipo || 'N/A'}
            </div>
            ${device.ubicacion ? `<div style="font-size: 0.8em; color: #888;">📍 ${device.ubicacion}</div>` : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${statusColor};"></span>
            <span style="font-size: 0.8em; color: #666;">${device.estado}</span>
          </div>
        </div>
      `;

      resultsContainer.appendChild(deviceElement);
    });
  }

  // Event listeners
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.trim();
      if (searchTerm.length > 0) {
        resultsContainer.style.display = "block";
        filterDevices(searchTerm);
      } else {
        resultsContainer.style.display = "none";
      }
    }, 300);
  });

  // Mostrar/ocultar resultados al hacer focus/blur
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length > 0) {
      resultsContainer.style.display = "block";
      filterDevices(searchInput.value.trim());
    }
  });

  // Ocultar resultados al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      resultsContainer.style.display = "none";
    }
  });

  // Si hay un dispositivo seleccionado, mostrarlo en el input
  if (selectedDevice) {
    searchInput.value = selectedDevice.nombre;
  }

  return container;
}

// Función para crear un widget de información del dispositivo seleccionado
export function selectedDeviceInfoWidget() {
  const { selectedDevice } = getState();
  
  if (!selectedDevice) {
    return el("div", {
      class: "card",
      style: "text-align: center; color: #666; padding: 20px;"
    }, "No hay dispositivo seleccionado");
  }

  const statusColor = selectedDevice.estado === 'en_linea' ? '#4CAF50' : 
                     selectedDevice.estado === 'fuera_linea' ? '#FF9800' : '#F44336';

  return el("div", {
    class: "card"
  }, 
    el("h3", {}, "Dispositivo Seleccionado"),
    el("div", {
      style: "display: grid; grid-template-columns: 1fr 1fr; gap: 15px;"
    },
      el("div", {},
        el("h4", {}, "Información General"),
        el("ul", { style: "list-style: none; padding: 0;" },
          el("li", { style: "margin-bottom: 8px;" }, 
            el("strong", {}, "Nombre: "), selectedDevice.nombre
          ),
          el("li", { style: "margin-bottom: 8px;" }, 
            el("strong", {}, "ID: "), selectedDevice.id_dispositivo
          ),
          el("li", { style: "margin-bottom: 8px;" }, 
            el("strong", {}, "Tipo: "), selectedDevice.tipo || 'N/A'
          ),
          el("li", { style: "margin-bottom: 8px;" }, 
            el("strong", {}, "Ubicación: "), selectedDevice.ubicacion || 'N/A'
          )
        )
      ),
      el("div", {},
        el("h4", {}, "Estado"),
        el("div", {
          style: "display: flex; align-items: center; gap: 10px; margin-bottom: 10px;"
        },
          el("span", {
            style: `width: 12px; height: 12px; border-radius: 50%; background-color: ${statusColor};`
          }),
          el("span", { style: "text-transform: capitalize;" }, selectedDevice.estado)
        ),
        el("div", {},
          el("strong", {}, "Última conexión: "),
          selectedDevice.ultima_conexion ? 
            new Date(selectedDevice.ultima_conexion).toLocaleString() : 
            'Nunca'
        )
      )
    )
  );
}
