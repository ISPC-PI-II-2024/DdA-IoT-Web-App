-- Script para insertar dispositivos de prueba en la base de datos
-- Este script debe ejecutarse después de la inicialización de la base de datos

USE `silo_db`;

-- Insertar dispositivos de prueba
INSERT IGNORE INTO dispositivos (id_dispositivo, nombre, tipo, ubicacion, estado, ultima_conexion, metadatos) VALUES
('DEV001', 'Sensor de Temperatura Principal', 'Sensor de Temperatura', 'Laboratorio A', 'en_linea', NOW(), '{"fabricante": "Sensortech", "modelo": "ST-100", "version": "1.2"}'),
('DEV002', 'Sensor de Humedad', 'Sensor de Humedad', 'Laboratorio B', 'en_linea', NOW() - INTERVAL 5 MINUTE, '{"fabricante": "HumidityPro", "modelo": "HP-200", "version": "2.0"}'),
('DEV003', 'Sensor de Presión Atmosférica', 'Sensor de Presión', 'Exterior', 'fuera_linea', NOW() - INTERVAL 1 HOUR, '{"fabricante": "PressureCorp", "modelo": "PC-300", "version": "1.5"}'),
('DEV004', 'Sensor de Calidad del Aire', 'Sensor Ambiental', 'Oficina Principal', 'en_linea', NOW() - INTERVAL 2 MINUTE, '{"fabricante": "AirQuality Inc", "modelo": "AQ-400", "version": "3.1"}'),
('DEV005', 'Sensor de Movimiento', 'Sensor de Movimiento', 'Entrada Principal', 'error', NOW() - INTERVAL 1 DAY, '{"fabricante": "MotionTech", "modelo": "MT-500", "version": "1.0"}'),
('DEV006', 'Sensor de Luz', 'Sensor de Luz', 'Pasillo Central', 'en_linea', NOW() - INTERVAL 10 MINUTE, '{"fabricante": "LightSense", "modelo": "LS-600", "version": "2.3"}'),
('DEV007', 'Sensor de Sonido', 'Sensor de Sonido', 'Sala de Reuniones', 'fuera_linea', NOW() - INTERVAL 30 MINUTE, '{"fabricante": "SoundDetect", "modelo": "SD-700", "version": "1.8"}'),
('DEV008', 'Sensor de Vibración', 'Sensor de Vibración', 'Máquina Principal', 'en_linea', NOW() - INTERVAL 1 MINUTE, '{"fabricante": "VibroTech", "modelo": "VT-800", "version": "2.1"}');

-- Insertar datos de sensores de prueba para algunos dispositivos
INSERT IGNORE INTO datos_sensores (id_dispositivo, tipo_sensor, valor, unidad, timestamp, metadatos) VALUES
-- Datos para DEV001 (Sensor de Temperatura)
('DEV001', 'temperatura', 23.5, '°C', NOW() - INTERVAL 0 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.2, '°C', NOW() - INTERVAL 1 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.8, '°C', NOW() - INTERVAL 2 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 24.1, '°C', NOW() - INTERVAL 3 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.9, '°C', NOW() - INTERVAL 4 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.6, '°C', NOW() - INTERVAL 5 MINUTE, '{"precision": 0.1}'),

-- Datos para DEV002 (Sensor de Humedad)
('DEV002', 'humedad', 45.2, '%', NOW() - INTERVAL 0 MINUTE, '{"precision": 0.5}'),
('DEV002', 'humedad', 45.8, '%', NOW() - INTERVAL 1 MINUTE, '{"precision": 0.5}'),
('DEV002', 'humedad', 46.1, '%', NOW() - INTERVAL 2 MINUTE, '{"precision": 0.5}'),
('DEV002', 'humedad', 45.5, '%', NOW() - INTERVAL 3 MINUTE, '{"precision": 0.5}'),
('DEV002', 'humedad', 45.9, '%', NOW() - INTERVAL 4 MINUTE, '{"precision": 0.5}'),

-- Datos para DEV004 (Sensor de Calidad del Aire)
('DEV004', 'co2', 420, 'ppm', NOW() - INTERVAL 0 MINUTE, '{"precision": 1}'),
('DEV004', 'co2', 425, 'ppm', NOW() - INTERVAL 1 MINUTE, '{"precision": 1}'),
('DEV004', 'co2', 418, 'ppm', NOW() - INTERVAL 2 MINUTE, '{"precision": 1}'),
('DEV004', 'pm25', 15.2, 'μg/m³', NOW() - INTERVAL 0 MINUTE, '{"precision": 0.1}'),
('DEV004', 'pm25', 16.1, 'μg/m³', NOW() - INTERVAL 1 MINUTE, '{"precision": 0.1}'),
('DEV004', 'pm25', 14.8, 'μg/m³', NOW() - INTERVAL 2 MINUTE, '{"precision": 0.1}'),

-- Datos para DEV006 (Sensor de Luz)
('DEV006', 'luminosidad', 850, 'lux', NOW() - INTERVAL 0 MINUTE, '{"precision": 10}'),
('DEV006', 'luminosidad', 920, 'lux', NOW() - INTERVAL 1 MINUTE, '{"precision": 10}'),
('DEV006', 'luminosidad', 780, 'lux', NOW() - INTERVAL 2 MINUTE, '{"precision": 10}'),
('DEV006', 'luminosidad', 950, 'lux', NOW() - INTERVAL 3 MINUTE, '{"precision": 10}'),

-- Datos para DEV008 (Sensor de Vibración)
('DEV008', 'vibracion_x', 0.15, 'g', NOW() - INTERVAL 0 MINUTE, '{"precision": 0.01}'),
('DEV008', 'vibracion_y', 0.12, 'g', NOW() - INTERVAL 0 MINUTE, '{"precision": 0.01}'),
('DEV008', 'vibracion_z', 0.18, 'g', NOW() - INTERVAL 0 MINUTE, '{"precision": 0.01}'),
('DEV008', 'vibracion_x', 0.14, 'g', NOW() - INTERVAL 1 MINUTE, '{"precision": 0.01}'),
('DEV008', 'vibracion_y', 0.13, 'g', NOW() - INTERVAL 1 MINUTE, '{"precision": 0.01}'),
('DEV008', 'vibracion_z', 0.16, 'g', NOW() - INTERVAL 1 MINUTE, '{"precision": 0.01}');

-- Insertar más datos históricos para tener más información
INSERT IGNORE INTO datos_sensores (id_dispositivo, tipo_sensor, valor, unidad, timestamp, metadatos) VALUES
-- Datos históricos para DEV001 (últimas 2 horas)
('DEV001', 'temperatura', 22.8, '°C', NOW() - INTERVAL 10 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.1, '°C', NOW() - INTERVAL 15 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 22.9, '°C', NOW() - INTERVAL 20 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.3, '°C', NOW() - INTERVAL 25 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.0, '°C', NOW() - INTERVAL 30 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 22.7, '°C', NOW() - INTERVAL 35 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.2, '°C', NOW() - INTERVAL 40 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.4, '°C', NOW() - INTERVAL 45 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.1, '°C', NOW() - INTERVAL 50 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 22.8, '°C', NOW() - INTERVAL 55 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.0, '°C', NOW() - INTERVAL 60 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 22.9, '°C', NOW() - INTERVAL 65 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.2, '°C', NOW() - INTERVAL 70 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.5, '°C', NOW() - INTERVAL 75 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.3, '°C', NOW() - INTERVAL 80 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.1, '°C', NOW() - INTERVAL 85 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 22.8, '°C', NOW() - INTERVAL 90 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.0, '°C', NOW() - INTERVAL 95 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.2, '°C', NOW() - INTERVAL 100 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.4, '°C', NOW() - INTERVAL 105 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.1, '°C', NOW() - INTERVAL 110 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 22.9, '°C', NOW() - INTERVAL 115 MINUTE, '{"precision": 0.1}'),
('DEV001', 'temperatura', 23.3, '°C', NOW() - INTERVAL 120 MINUTE, '{"precision": 0.1}');

-- Verificar que los datos se insertaron correctamente
SELECT 
    d.nombre,
    d.id_dispositivo,
    d.estado,
    COUNT(ds.id) as total_datos,
    MAX(ds.timestamp) as ultimo_dato
FROM dispositivos d
LEFT JOIN datos_sensores ds ON d.id_dispositivo = ds.id_dispositivo
GROUP BY d.id
ORDER BY d.nombre;
