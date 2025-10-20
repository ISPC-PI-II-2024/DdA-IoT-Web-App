// --------------------------------------------------------------------
// Controladores para manejar datos y operaciones relacionadas
// --------------------------------------------------------------------

// IMPORTACIONES
import { getAllDevices, getDeviceById, getDeviceSensorData, getDeviceStats } from "../service/data.service.js";

// --------------------------------------------------------------------
// FUNCIONES
// --------------------------------------------------------------------

/**
 * Obtiene todos los dispositivos disponibles
 */
export async function getAllDevicesController(req, res) {
  try {
    const devices = await getAllDevices();
    res.json({
      success: true,
      data: devices,
      count: devices.length
    });
  } catch (error) {
    console.error('Error en getAllDevicesController:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}

/**
 * Obtiene información detallada de un dispositivo específico
 */
export async function getDeviceByIdController(req, res) {
  try {
    const { deviceId } = req.params;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'ID del dispositivo requerido'
      });
    }

    const device = await getDeviceById(deviceId);
    const stats = await getDeviceStats(deviceId);
    
    res.json({
      success: true,
      data: {
        device,
        stats
      }
    });
  } catch (error) {
    console.error('Error en getDeviceByIdController:', error);
    
    if (error.message === 'Dispositivo no encontrado') {
      return res.status(404).json({
        success: false,
        error: 'Dispositivo no encontrado'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}

/**
 * Obtiene los datos de sensores de un dispositivo específico
 */
export async function getDeviceSensorDataController(req, res) {
  try {
    const { deviceId } = req.params;
    const { limit = 100 } = req.query;
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'ID del dispositivo requerido'
      });
    }

    const sensorData = await getDeviceSensorData(deviceId, parseInt(limit));
    
    res.json({
      success: true,
      data: sensorData,
      count: sensorData.length
    });
  } catch (error) {
    console.error('Error en getDeviceSensorDataController:', error);
    
    if (error.message === 'Dispositivo no encontrado') {
      return res.status(404).json({
        success: false,
        error: 'Dispositivo no encontrado'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}

// EXPORTACION
export default {
  getAllDevicesController,
  getDeviceByIdController,
  getDeviceSensorDataController
};