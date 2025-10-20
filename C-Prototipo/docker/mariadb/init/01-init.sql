-- =========================
-- Script de inicialización de MariaDB para WebAPP-DB
-- =========================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `WebAPP-DB` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE `WebAPP-DB`;

-- Tabla de usuarios (vinculados con Google)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    foto_url TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    metadatos JSON DEFAULT ('{}')
);

-- Tabla de usuarios de Google (simplificada para login)
CREATE TABLE IF NOT EXISTS usuarios_google (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mail VARCHAR(255) UNIQUE NOT NULL,
    admin BOOLEAN DEFAULT FALSE,
    action BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    nombre_mostrar VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    nombre_mostrar VARCHAR(150) NOT NULL,
    descripcion TEXT,
    recurso VARCHAR(100),
    accion VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asignación permisos a roles
CREATE TABLE IF NOT EXISTS permisos_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT,
    permiso_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rol_permiso (rol_id, permiso_id)
);

-- Asignación roles a usuarios
CREATE TABLE IF NOT EXISTS usuarios_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    rol_id INT,
    asignado_por INT,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NULL,
    activo BOOLEAN DEFAULT true,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id),
    UNIQUE KEY unique_usuario_rol (usuario_id, rol_id)
);

-- Tabla de sesiones de usuario
CREATE TABLE IF NOT EXISTS sesiones_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    token_sesion VARCHAR(255) UNIQUE NOT NULL,
    token_renovacion VARCHAR(255),
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    direccion_ip VARCHAR(45),
    agente_usuario TEXT,
    activo BOOLEAN DEFAULT true,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de logs de actividad
CREATE TABLE IF NOT EXISTS logs_actividad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    tipo_recurso VARCHAR(50),
    id_recurso INT,
    detalles JSON DEFAULT ('{}'),
    direccion_ip VARCHAR(45),
    agente_usuario TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de dispositivos IoT
CREATE TABLE IF NOT EXISTS dispositivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_dispositivo VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    ubicacion VARCHAR(255),
    estado ENUM('en_linea', 'fuera_linea', 'error') DEFAULT 'fuera_linea',
    ultima_conexion TIMESTAMP,
    metadatos JSON DEFAULT ('{}'),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de datos de sensores
CREATE TABLE IF NOT EXISTS datos_sensores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_dispositivo VARCHAR(100),
    tipo_sensor VARCHAR(100),
    valor DECIMAL(10,4),
    unidad VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadatos JSON DEFAULT ('{}'),
    FOREIGN KEY (id_dispositivo) REFERENCES dispositivos(id_dispositivo) ON DELETE CASCADE,
    INDEX idx_dispositivo_timestamp (id_dispositivo, timestamp),
    INDEX idx_timestamp (timestamp)
);

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado ENUM('activo', 'inactivo', 'archivado') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creado_por INT,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

-- Tabla de asignación usuarios a proyectos
CREATE TABLE IF NOT EXISTS usuarios_proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    proyecto_id INT,
    rol_proyecto ENUM('administrador', 'operador', 'visualizador') DEFAULT 'visualizador',
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_proyecto (usuario_id, proyecto_id)
);

-- Tabla de configuraciones del sistema
CREATE TABLE IF NOT EXISTS configuraciones_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar roles base
INSERT IGNORE INTO roles (nombre, nombre_mostrar, descripcion) VALUES
('administrador', 'Administrador', 'Acceso completo al sistema, gestión de usuarios y configuración'),
('operador', 'Operador', 'Control de dispositivos y operaciones del sistema'),
('visualizador', 'Visualizador', 'Solo lectura, visualización de datos y reportes');

-- Insertar permisos del sistema
INSERT IGNORE INTO permisos (nombre, nombre_mostrar, descripcion, recurso, accion) VALUES
-- Permisos de gestión de usuarios
('gestionar_usuarios', 'Gestionar Usuarios', 'Crear, editar y eliminar usuarios', 'usuarios', 'gestionar'),
('ver_usuarios', 'Ver Usuarios', 'Listar y ver información de usuarios', 'usuarios', 'leer'),
('asignar_roles', 'Asignar Roles', 'Asignar y revocar roles a usuarios', 'usuarios', 'asignar_roles'),

-- Permisos de dispositivos IoT
('controlar_dispositivos', 'Controlar Dispositivos', 'Enviar comandos a dispositivos IoT', 'dispositivos', 'controlar'),
('ver_dispositivos', 'Ver Dispositivos', 'Visualizar estado de dispositivos', 'dispositivos', 'leer'),
('gestionar_dispositivos', 'Gestionar Dispositivos', 'Agregar, editar y eliminar dispositivos', 'dispositivos', 'gestionar'),

-- Permisos de dashboard y datos
('ver_dashboard', 'Ver Dashboard', 'Acceso al panel principal', 'dashboard', 'leer'),
('ver_analiticas', 'Ver Analíticas', 'Acceso a reportes y estadísticas', 'analiticas', 'leer'),
('exportar_datos', 'Exportar Datos', 'Exportar datos del sistema', 'datos', 'exportar'),

-- Permisos de proyectos
('gestionar_proyectos', 'Gestionar Proyectos', 'Crear, editar y eliminar proyectos', 'proyectos', 'gestionar'),
('ver_proyectos', 'Ver Proyectos', 'Visualizar proyectos asignados', 'proyectos', 'leer'),
('asignar_proyectos', 'Asignar Proyectos', 'Asignar usuarios a proyectos', 'proyectos', 'asignar'),

-- Permisos de configuración
('gestionar_sistema', 'Gestionar Sistema', 'Configuración del sistema', 'sistema', 'gestionar'),
('ver_logs', 'Ver Logs', 'Visualizar logs del sistema', 'logs', 'leer');

-- Asignar permisos a roles
-- Administrador: todos los permisos
INSERT IGNORE INTO permisos_roles (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'administrador';

-- Operador: permisos operacionales
INSERT IGNORE INTO permisos_roles (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'operador' 
AND p.nombre IN (
    'ver_usuarios', 'controlar_dispositivos', 'ver_dispositivos', 
    'ver_dashboard', 'ver_analiticas', 'ver_logs', 'ver_proyectos'
);

-- Visualizador: solo lectura
INSERT IGNORE INTO permisos_roles (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'visualizador' 
AND p.nombre IN (
    'ver_usuarios', 'ver_dispositivos', 'ver_dashboard', 
    'ver_analiticas', 'ver_proyectos'
);

-- Insertar configuraciones del sistema por defecto
INSERT IGNORE INTO configuraciones_sistema (clave, valor, descripcion, tipo) VALUES
('nombre_sistema', 'TST-DA IoT WebApp', 'Nombre del sistema', 'string'),
('version_sistema', '1.0.0', 'Versión actual del sistema', 'string'),
('mantenimiento_activo', 'false', 'Indica si el sistema está en mantenimiento', 'boolean'),
('max_intentos_login', '5', 'Máximo número de intentos de login', 'number'),
('tiempo_bloqueo_login', '900', 'Tiempo de bloqueo tras exceder intentos (segundos)', 'number'),
('mqtt_topics_default', 'vittoriodurigutti/prueba,vittoriodurigutti/temperature', 'Topics MQTT por defecto', 'string'),
('influxdb_retention_days', '30', 'Días de retención de datos en InfluxDB', 'number'),
('notificaciones_email', 'true', 'Habilitar notificaciones por email', 'boolean'),
('backup_automatico', 'true', 'Habilitar backup automático de la base de datos', 'boolean'),
('log_level', 'info', 'Nivel de logging del sistema', 'string');

-- Crear proyecto por defecto
INSERT IGNORE INTO proyectos (nombre, descripcion, estado, creado_por) VALUES
('Proyecto Principal', 'Proyecto principal del sistema TST-DA', 'activo', 1);

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_google_id ON usuarios(google_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario_id ON usuarios_roles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_rol_id ON usuarios_roles(rol_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_activo ON usuarios_roles(activo);
CREATE INDEX IF NOT EXISTS idx_permisos_roles_rol_id ON permisos_roles(rol_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones_usuarios(token_sesion);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON sesiones_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_usuario_id ON logs_actividad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_fecha_creacion ON logs_actividad(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_dispositivos_id_dispositivo ON dispositivos(id_dispositivo);
CREATE INDEX IF NOT EXISTS idx_dispositivos_estado ON dispositivos(estado);
CREATE INDEX IF NOT EXISTS idx_datos_sensores_id_dispositivo ON datos_sensores(id_dispositivo);
CREATE INDEX IF NOT EXISTS idx_datos_sensores_timestamp ON datos_sensores(timestamp);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_proyectos_usuario_id ON usuarios_proyectos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_proyectos_proyecto_id ON usuarios_proyectos(proyecto_id);

-- Crear base de datos para Nginx Proxy Manager
CREATE DATABASE IF NOT EXISTS npm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario específico para la aplicación (si no existe)
CREATE USER IF NOT EXISTS 'webapp_user'@'%' IDENTIFIED BY 'webapp_password_2024';
GRANT ALL PRIVILEGES ON `WebAPP-DB`.* TO 'webapp_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON npm_db.* TO 'webapp_user'@'%';
FLUSH PRIVILEGES;

-- Crear vistas útiles para reportes
CREATE OR REPLACE VIEW vista_usuarios_activos AS
SELECT 
    u.id,
    u.email,
    u.nombre,
    u.foto_url,
    u.ultimo_acceso,
    GROUP_CONCAT(r.nombre_mostrar) as roles,
    COUNT(DISTINCT up.proyecto_id) as proyectos_asignados
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.id = ur.usuario_id AND ur.activo = true
LEFT JOIN roles r ON ur.rol_id = r.id AND r.activo = true
LEFT JOIN usuarios_proyectos up ON u.id = up.usuario_id AND up.activo = true
WHERE u.activo = true
GROUP BY u.id;

CREATE OR REPLACE VIEW vista_dispositivos_estado AS
SELECT 
    d.id,
    d.id_dispositivo,
    d.nombre,
    d.tipo,
    d.ubicacion,
    d.estado,
    d.ultima_conexion,
    COUNT(ds.id) as total_datos,
    MAX(ds.timestamp) as ultimo_dato
FROM dispositivos d
LEFT JOIN datos_sensores ds ON d.id_dispositivo = ds.id_dispositivo
GROUP BY d.id;

-- Insertar datos de prueba (opcional - comentar en producción)
INSERT IGNORE INTO usuarios (google_id, email, nombre, activo) VALUES
('google_123456789', 'admin@webapp.com', 'Administrador Sistema', true),
('google_987654321', 'operador@webapp.com', 'Operador Principal', true);

-- Insertar usuarios de Google de prueba
INSERT IGNORE INTO usuarios_google (mail, admin, action) VALUES
('vittodutti@gmail.com', TRUE, TRUE),
('admin@webapp.com', TRUE, FALSE),
('operador@webapp.com', FALSE, TRUE),
('usuario@webapp.com', FALSE, FALSE),
('dev@localhost.com', TRUE, TRUE);

-- Asignar roles a usuarios de prueba
INSERT IGNORE INTO usuarios_roles (usuario_id, rol_id, asignado_por)
SELECT u.id, r.id, u.id
FROM usuarios u, roles r
WHERE u.email = 'admin@webapp.com' AND r.nombre = 'administrador';

INSERT IGNORE INTO usuarios_roles (usuario_id, rol_id, asignado_por)
SELECT u.id, r.id, u.id
FROM usuarios u, roles r
WHERE u.email = 'operador@webapp.com' AND r.nombre = 'operador';

-- Asignar usuarios de prueba al proyecto principal
INSERT IGNORE INTO usuarios_proyectos (usuario_id, proyecto_id, rol_proyecto)
SELECT u.id, p.id, 'administrador'
FROM usuarios u, proyectos p
WHERE u.email = 'admin@webapp.com' AND p.nombre = 'Proyecto Principal';

INSERT IGNORE INTO usuarios_proyectos (usuario_id, proyecto_id, rol_proyecto)
SELECT u.id, p.id, 'operador'
FROM usuarios u, proyectos p
WHERE u.email = 'operador@webapp.com' AND p.nombre = 'Proyecto Principal';
