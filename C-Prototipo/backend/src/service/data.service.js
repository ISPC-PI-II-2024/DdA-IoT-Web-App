// --------------------------------------------------------------------
// Servicio de datos y operaciones relacionadas
// --------------------------------------------------------------------

// IMPORTACIONES
import { pool } from "../db/index.js";

// --------------------------------------------------------------------
// FUNCIONES
// --------------------------------------------------------------------

/**
 * Obtiene todos los dispositivos disponibles
 * @returns {Promise<Array>} Lista de dispositivos
 */
export async function getAllDevices() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id,
        id_dispositivo,
        nombre,
        tipo,
        ubicacion,
        estado,
        ultima_conexion,
        fecha_creacion,
        fecha_actualizacion
      FROM dispositivos 
      ORDER BY nombre ASC
    `);
    
    return rows;
  } catch (error) {
    console.error('Error obteniendo dispositivos:', error);
    throw error;
  }
}

/**
 * Obtiene información detallada de un dispositivo específico
 * @param {string} deviceId - ID del dispositivo
 * @returns {Promise<Object>} Información del dispositivo
 */
export async function getDeviceById(deviceId) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id,
        id_dispositivo,
        nombre,
        tipo,
        ubicacion,
        estado,
        ultima_conexion,
        metadatos,
        fecha_creacion,
        fecha_actualizacion
      FROM dispositivos 
      WHERE id_dispositivo = ? OR id = ?
    `, [deviceId, deviceId]);
    
    if (rows.length === 0) {
      throw new Error('Dispositivo no encontrado');
    }
    
    return rows[0];
  } catch (error) {
    console.error('Error obteniendo dispositivo:', error);
    throw error;
  }
}

/**
 * Obtiene los datos de sensores de un dispositivo específico
 * @param {string} deviceId - ID del dispositivo
 * @param {number} limit - Límite de registros (default: 100)
 * @returns {Promise<Array>} Datos de sensores del dispositivo
 */
export async function getDeviceSensorData(deviceId, limit = 100) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id,
        tipo_sensor,
        valor,
        unidad,
        timestamp,
        metadatos
      FROM datos_sensores 
      WHERE id_dispositivo = (
        SELECT id_dispositivo FROM dispositivos 
        WHERE id_dispositivo = ? OR id = ?
      )
      ORDER BY timestamp DESC
      LIMIT ?
    `, [deviceId, deviceId, limit]);
    
    return rows;
  } catch (error) {
    console.error('Error obteniendo datos de sensores:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de un dispositivo
 * @param {string} deviceId - ID del dispositivo
 * @returns {Promise<Object>} Estadísticas del dispositivo
 */
export async function getDeviceStats(deviceId) {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_datos,
        MAX(timestamp) as ultimo_dato,
        MIN(timestamp) as primer_dato,
        COUNT(DISTINCT tipo_sensor) as tipos_sensor,
        AVG(valor) as promedio_valor
      FROM datos_sensores 
      WHERE id_dispositivo = (
        SELECT id_dispositivo FROM dispositivos 
        WHERE id_dispositivo = ? OR id = ?
      )
    `, [deviceId, deviceId]);
    
    return stats[0];
  } catch (error) {
    console.error('Error obteniendo estadísticas del dispositivo:', error);
    throw error;
  }
}

// EXPORTACION