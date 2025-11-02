# Aplicación Web IoT - Documentación Técnica

## Descripción General

Esta es una aplicación web IoT full-stack desarrollada con backend Node.js/Express y frontend vanilla JavaScript, diseñada para el monitoreo en tiempo real de sensores IoT (temperatura, humedad, CO2) y visualización de datos a través de comunicación MQTT. El sistema implementa una arquitectura jerárquica **Gateway → Endpoints → Sensores** y proporciona un frontend personalizado y adaptable a las necesidades presentadas por el proyecto Intertecnicatura del ISPC.

La aplicación está desplegada usando Docker Compose con múltiples servicios integrados: backend Node.js, frontend Nginx, base de datos MariaDB, InfluxDB para time-series, broker MQTT (Mosquitto), Node-RED, Grafana y Telegraf.

## Índice

- [Arquitectura](#arquitectura)
  - [Arquitectura del Backend](#arquitectura-del-backend)
  - [Arquitectura del Frontend](#arquitectura-del-frontend)
- [Stack Tecnológico](#stack-tecnológico)
  - [Tecnologías del Backend](#tecnologías-del-backend)
  - [Tecnologías del Frontend](#tecnologías-del-frontend)
- [Características Principales](#características-principales)
  - [Autenticación y Autorización](#autenticación-y-autorización)
  - [Integración MQTT](#integración-mqtt)
  - [Comunicación WebSocket](#comunicación-websocket)
  - [Esquema de Base de Datos](#esquema-de-base-de-datos)
- [Endpoints de API](#endpoints-de-api)
  - [Autenticación](#autenticación)
  - [Configuración](#configuración)
  - [Datos de Temperatura](#datos-de-temperatura)
  - [WebSocket](#websocket)
- [Gestión de Configuración](#gestión-de-configuración)
  - [Variables de Entorno](#variables-de-entorno)
  - [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Configuración de Desarrollo](#configuración-de-desarrollo)
  - [Prerrequisitos](#prerrequisitos)
  - [Instalación](#instalación)
  - [Desarrollo del Frontend](#desarrollo-del-frontend)
- [Consideraciones de Seguridad](#consideraciones-de-seguridad)
  - [Seguridad de Autenticación](#seguridad-de-autenticación)
  - [Seguridad de Datos](#seguridad-de-datos)
  - [Seguridad de Red](#seguridad-de-red)
- [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)
  - [Optimizaciones del Backend](#optimizaciones-del-backend)
  - [Optimizaciones del Frontend](#optimizaciones-del-frontend)
- [Monitoreo y Registro](#monitoreo-y-registro)
  - [Registros de Aplicación](#registros-de-aplicación)
  - [Verificaciones de Salud](#verificaciones-de-salud)
  - [Métricas Disponibles](#métricas-disponibles)
- [Solución de Problemas](#solución-de-problemas)
  - [Problemas Comunes](#problemas-comunes)
  - [Modo Debug](#modo-debug)
- [Contribución](#contribución)
  - [Estilo de Código](#estilo-de-código)
  - [Pruebas](#pruebas)
- [Licencia](#licencia)

## Arquitectura

### Arquitectura del Backend

```
backend/
├── src/
│   ├── config/           # Gestión de configuración
│   │   ├── env.js        # Validación de variables de entorno
│   │   └── security.js   # Configuración de seguridad Helmet
│   ├── controllers/      # Manejadores de solicitudes
│   │   ├── auth.controllers.js      # Autenticación Google OAuth
│   │   ├── config.controllers.js    # Gestión de configuración del sistema
│   │   ├── data.controllers.js       # Operaciones de datos genéricos
│   │   ├── temperature.controllers.js # Endpoints de datos de temperatura
│   │   ├── CO2.controllers.js        # Endpoints de datos de CO2
│   │   └── gateway.controllers.js   # Gestión de gateways, endpoints y sensores
│   ├── middlewares/     # Middlewares de Express
│   │   ├── auth.middlewares.js       # Autenticación JWT y acceso basado en roles
│   │   └── data.middlewares.js       # Middlewares de procesamiento de datos
│   ├── routes/          # Definiciones de rutas API
│   │   ├── auth.routes.js            # Rutas de autenticación
│   │   ├── config.routes.js          # Configuración pública
│   │   ├── config.system.routes.js  # Configuración del sistema (protegida)
│   │   ├── data.routes.js            # Rutas de datos genéricos
│   │   ├── temperature.routes.js      # Rutas de datos de temperatura
│   │   ├── CO2.routes.js              # Rutas de datos de CO2
│   │   └── gateway.routes.js         # Rutas de gateways, endpoints y sensores
│   ├── service/         # Servicios de lógica de negocio
│   │   ├── data.service.js           # Operaciones de base de datos
│   │   ├── jwt.service.js            # Gestión de tokens JWT
│   │   ├── mqtt.service.js           # Comunicación con broker MQTT
│   │   └── user.service.js           # Resolución de roles de usuario
│   ├── sw/              # Implementación WebSocket
│   │   ├── index.js                  # Servidor WebSocket con autenticación JWT
│   │   ├── handlers.js               # Manejadores de mensajes WebSocket
│   │   └── uWebSockets.js            # Implementación alternativa WebSocket
│   ├── db/              # Configuración de base de datos
│   │   └── index.js                 # Pool de conexiones MariaDB
│   └── server.js        # Punto de entrada principal del servidor
└── package.json
```

### Arquitectura del Frontend

```
frontend/public/
├── src/
│   ├── api.js                       # Cliente API con autenticación
│   ├── app.js                       # Inicialización principal de la aplicación
│   ├── components/                  # Componentes UI reutilizables
│   │   ├── alertWidget.js          # Widget de alertas activas
│   │   ├── chartWidget.js          # Componente de gráfico genérico
│   │   ├── deviceSelector.js       # Selector de dispositivos
│   │   ├── deviceVisualization.js  # Visualización SVG de dispositivos
│   │   ├── footer.js               # Componente de pie de página
│   │   ├── generalStatusWidget.js  # Widget de estado general
│   │   ├── loadingIndicator.js     # Indicador de carga
│   │   ├── mqttLogsWidget.js       # Widget de logs MQTT en tiempo real
│   │   ├── mqttTopicsManager.js    # Gestor de tópicos MQTT
│   │   ├── navbar.js               # Barra de navegación con menús basados en roles
│   │   ├── systemStatusWidget.js   # Widget de estado del sistema
│   │   └── temperatureChart.js     # Gráfico específico de temperatura
│   ├── pages/                       # Componentes de página
│   │   ├── configuracion.js        # Página de configuración general
│   │   ├── configuracionAvanzada.js # Configuración avanzada (solo admin)
│   │   ├── dashboard.js            # Dashboard principal con múltiples widgets
│   │   ├── dispositivos.js        # Vista jerárquica de dispositivos
│   │   ├── login.js                # Login Google OAuth
│   │   ├── notFound.js             # Página de error 404
│   │   └── sobreNosotros.js        # Página sobre nosotros
│   ├── router/                      # Enrutamiento del lado del cliente
│   │   └── index.js                # Enrutamiento basado en hash con protección de roles
│   ├── state/                       # Gestión de estado
│   │   └── store.js                # Store de estado reactivo simple
│   ├── utils/                       # Funciones utilitarias
│   │   ├── alertService.js         # Servicio de alertas y notificaciones
│   │   ├── cacheService.js         # Servicio de caché
│   │   ├── configService.js        # Servicio de gestión de configuración
│   │   ├── deviceService.js        # Servicio de gestión de dispositivos
│   │   ├── dom.js                  # Ayudantes de manipulación DOM
│   │   ├── logger.js               # Utilidad de logging
│   │   ├── mqttTopicsService.js    # Servicio de gestión de tópicos MQTT
│   │   └── storage.js              # Wrapper de almacenamiento local/sesión
│   ├── ws.js                        # Cliente WebSocket
│   └── loader.js                   # Cargador de aplicación
├── style.css                       # Estilos globales
├── sw.js                           # Service worker
└── config.json                     # Configuración del frontend
```

## Stack Tecnológico

### Tecnologías del Backend

- **Node.js 18+** - Entorno de ejecución
- **Express.js** - Framework web
- **JWT (jose)** - Autenticación basada en tokens
- **MQTT (mqtt v5)** - Protocolo de comunicación IoT
- **WebSocket (ws)** - Comunicación en tiempo real
- **MariaDB** - Base de datos relacional (pool de conexiones)
- **InfluxDB** - Base de datos time-series (integración vía cliente HTTP)
- **Joi** - Validación de datos
- **Helmet** - Middleware de seguridad
- **CORS** - Intercambio de recursos de origen cruzado
- **Morgan** - Registrador de solicitudes HTTP
- **Cookie-parser** - Manejo de cookies

### Tecnologías del Frontend

- **Vanilla JavaScript (ES6+)** - Sin dependencias de framework
- **Canvas API** - Renderizado de gráficos de temperatura, humedad y CO2
- **SVG API** - Visualización de dispositivos y posicionamiento de sensores
- **WebSocket API** - Datos en tiempo real desde el backend
- **Google Identity Services** - Autenticación OAuth 2.0
- **Service Worker** - Capacidades offline y PWA
- **CSS3** - Estilos con CSS Grid y Flexbox, diseño responsivo
- **Notification API** - Alertas del navegador

## Características Principales

### Autenticación y Autorización

#### Integración con Google OAuth
- Utiliza Google Identity Services para autenticación
- Valida tokens ID contra JWKS de Google
- Emite tokens JWT personalizados con roles embebidos

#### Control de Acceso Basado en Roles (RBAC)
```javascript
// Jerarquía de roles
- admin: Acceso completo al sistema
- action: Control de dispositivos y operaciones
- readonly: Acceso solo de lectura
```

#### Gestión de Tokens JWT
- Tokens de acceso con expiración de 15 minutos
- Soporte para tokens de renovación (expiración de 7 días)
- Middleware de validación automática de tokens

### Integración MQTT

#### Gestión de Conexión
- Reconexión automática con retroceso exponencial
- Configuración de broker configurable (host, puerto, credenciales)
- Gestión de suscripciones a tópicos
- Nivel QoS 1 para entrega confiable de mensajes

#### Procesamiento de Datos
- Ingesta de datos de temperatura, humedad y CO2 en tiempo real
- Procesamiento de mensajes de gateways, endpoints y sensores
- Validación y análisis automático de datos
- Buffers circulares para almacenamiento de datos (máximo 100 puntos por tipo)
- Transmisión WebSocket a clientes conectados
- Almacenamiento en MariaDB (datos procesados) e InfluxDB (time-series)

#### Estructura Jerárquica de Dispositivos

El sistema gestiona tres niveles de dispositivos:

1. **Gateways**: Nodos LoRa que gestionan múltiples endpoints
2. **Endpoints**: Dispositivos intermedios con batería y múltiples sensores
3. **Sensores**: Dispositivos finales que miden variables ambientales

#### Formatos de Datos Soportados

**Gateways (tópico: `gateway/gateway`):**
```javascript
{
  "id": "gw001",
  "lora_status": "ok",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Endpoints (tópico: `gateway/endpoint`):**
```javascript
{
  "id": "ep001",
  "gateway_id": "gw001",
  "status": "ok",
  "battery": 85,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Sensores (tópico: `gateway/sensor`):**
```javascript
{
  "id": "sensor001",
  "gateway_id": "gw001",
  "endpoint_id": "ep001",
  "temperature": 23.5,
  "humidity": 65.2,
  "co2": 450,
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Formato numérico simple (compatibilidad):**
```javascript
"23.5"  // Temperatura única
```

### Comunicación WebSocket

#### Transmisión de Datos en Tiempo Real
- Conexiones WebSocket autenticadas con JWT
- Sistema de suscripción basado en tópicos
- Heartbeat/ping-pong automático para salud de conexión
- Transmisión de datos MQTT a clientes suscritos

#### Protocolo de Mensajes WebSocket

**Cliente a Servidor (Suscripción):**
```javascript
{
  "type": "sub",
  "topic": "temperature" | "co2" | "humidity" | "gateway/gateway" | "gateway/endpoint" | "gateway/sensor"
}
```

**Servidor a Cliente (Actualizaciones):**
```javascript
// Actualización de temperatura
{
  "type": "temperature_update",
  "data": { temperature: 23.5, timestamp: "2024-01-01T00:00:00.000Z" },
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// Actualización de CO2
{
  "type": "co2_update",
  "data": { co2: 450, timestamp: "2024-01-01T00:00:00.000Z" },
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// Actualización de gateway
{
  "type": "gateway_update",
  "data": { id: "gw001", lora_status: "ok", ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Esquema de Base de Datos

#### Tablas Principales (MariaDB)
- **usuarios** - Cuentas de usuario vinculadas a Google
- **roles** - Roles del sistema (admin, action, readonly)
- **permisos** - Permisos granulares
- **dispositivos** - Registro de dispositivos IoT (gateways, endpoints, sensores)
  - Campos: id, id_dispositivo, nombre, tipo (gateway/endpoint/sensor), ubicacion, estado, id_gateway, id_endpoint
- **valores_sensores** - Almacenamiento de datos de sensores procesados
  - Campos: id, topico, id_dispositivo, tipo_medicion, valor, unidad, timestamp_medicion, timestamp_recibido, metadata (JSON)
- **estado_dispositivos** - Estado de dispositivos en tiempo real
  - Campos: id, id_dispositivo, topico, datos_actuales (JSON), estado, ultima_actualizacion
- **proyectos** - Gestión de proyectos
- **configuraciones_sistema** - Configuraciones del sistema
- **telegraf_config** - Configuración de Telegraf

#### Base de Datos Time-Series (InfluxDB)
- **Mediciones MQTT**: Almacenamiento de todos los mensajes MQTT recibidos
- **Series temporales**: Datos organizados por tópico y timestamp
- **Retención**: Configurable (por defecto 24 horas para consultas rápidas)

#### Relaciones Clave
- Muchos a muchos: usuarios ↔ roles ↔ permisos
- Uno a muchos: dispositivos (gateway) → dispositivos (endpoints)
- Uno a muchos: dispositivos (endpoint) → dispositivos (sensores)
- Uno a muchos: dispositivos → valores_sensores
- Muchos a muchos: usuarios ↔ proyectos

## Endpoints de API

### Autenticación
```
POST /api/auth/google
Body: { "credential": "google_id_token" }
Response: { "user", "role", "accessToken", "tokenType", "expiresIn" }
```

### Configuración
```
GET  /api/config                    # Configuración pública
GET  /api/config/general            # Configuración general (autenticado)
GET  /api/config/advanced           # Configuración avanzada (solo admin)
PUT  /api/config/advanced           # Actualizar configuración avanzada (solo admin)
GET  /api/config/mqtt/status        # Estado de conexión MQTT
POST /api/config/mqtt/restart       # Reiniciar MQTT (solo admin)
POST /api/config/cache/clear        # Limpiar cache de datos (solo admin)
```

### Datos de Sensores
```
GET /api/temperature                # Datos históricos de temperatura
GET /api/temperature/stats          # Estadísticas de temperatura
GET /api/temperature/latest         # Última lectura de temperatura
GET /api/co2                        # Datos históricos de CO2
GET /api/co2/stats                  # Estadísticas de CO2
GET /api/co2/latest                 # Última lectura de CO2
GET /api/mqtt/status                # Información de conexión MQTT
```

### Gestión de Dispositivos
```
GET  /api/gateway                   # Listar todos los gateways
GET  /api/gateway/:gatewayId        # Obtener gateway específico con endpoints
GET  /api/endpoint                  # Listar todos los endpoints
GET  /api/endpoint/:endpointId      # Obtener endpoint específico con sensores
GET  /api/sensor                    # Listar todos los sensores
GET  /api/sensor/:sensorId          # Obtener sensor específico
GET  /api/sensor/endpoint/:endpointId # Sensores de un endpoint
GET  /api/gateway/status            # Estado completo del sistema
GET  /api/gateway/thresholds        # Obtener umbrales de alertas
PUT  /api/gateway/thresholds         # Actualizar umbrales (solo admin)
GET  /api/device                    # Listar todos los dispositivos desde DB
GET  /api/device/:deviceId          # Obtener dispositivo específico
GET  /api/device/:deviceId/sensor-data # Datos históricos de sensores de un dispositivo
GET  /api/device/:deviceId/historical # Datos históricos desde InfluxDB
```

### WebSocket
```
WS /ws?token=<jwt_token>
```

## Gestión de Configuración

### Variables de Entorno

#### Variables Requeridas
```bash
JWT_SECRET=<cadena_hex_64_caracteres>     # Secreto de firma JWT
GOOGLE_CLIENT_ID=<google_client_id>       # ID de cliente Google OAuth
```

#### Variables Opcionales
```bash
NODE_ENV=development                       # Modo de entorno
PORT=3000                                  # Puerto del servidor
CORS_ORIGIN=*                             # Orígenes CORS permitidos
MQTT_BROKER_HOST=localhost                 # Host del broker MQTT
MQTT_BROKER_PORT=1883                     # Puerto del broker MQTT
MQTT_BROKER_USERNAME=                     # Usuario MQTT (opcional)
MQTT_BROKER_PASSWORD=                     # Contraseña MQTT (opcional)
MQTT_TOPICS=gateway/gateway,gateway/endpoint,gateway/sensor,temperature,co2,humidity
ADMIN_WHITELIST=admin@ejemplo.com         # Lista de emails de admin
ACTION_WHITELIST=operador@ejemplo.com      # Lista de emails de operador
INFLUXDB_HOST=localhost                    # Host de InfluxDB
INFLUXDB_PORT=8086                        # Puerto de InfluxDB
INFLUXDB_DB=iot_data                       # Base de datos InfluxDB
INFLUXDB_ADMIN_USER=admin                  # Usuario admin de InfluxDB
INFLUXDB_ADMIN_PASSWORD=password           # Contraseña admin de InfluxDB
INFLUXDB_USER=telegraf                     # Usuario de lectura/escritura
INFLUXDB_USER_PASSWORD=telegraf_pass       # Contraseña del usuario
```

### Configuración de Base de Datos

**MariaDB:**
```bash
MYSQL_HOST=localhost
MYSQL_USER=tst_da_user
MYSQL_PASSWORD=tst_da_password_2024
MYSQL_DATABASE=TST-DA
MYSQL_ROOT_PASSWORD=root_password
```

**InfluxDB (opcional, para time-series):**
```bash
INFLUXDB_HOST=localhost
INFLUXDB_PORT=8086
INFLUXDB_DB=iot_data
INFLUXDB_ADMIN_USER=admin
INFLUXDB_ADMIN_PASSWORD=admin_password
INFLUXDB_USER=telegraf
INFLUXDB_USER_PASSWORD=telegraf_password
```

## Configuración de Desarrollo

### Prerrequisitos
- **Docker** y **Docker Compose** (recomendado para desarrollo completo)
- Node.js 18+ (solo si se ejecuta sin Docker)
- MariaDB 10.6+ (o usar contenedor Docker)
- InfluxDB 1.8+ (opcional, para time-series)
- Broker MQTT (Mosquitto) - incluido en docker-compose.yml
- Proyecto Google Cloud Console con credenciales OAuth

### Instalación

#### Opción 1: Docker Compose (Recomendado)

1. **Clonar repositorio**
```bash
git clone https://github.com/ISPC-PI-II-2024/DdA-IoT-Web-App.git
cd C-Prototipo
```

2. **Configurar variables de entorno**
```bash
# Crear archivo .env en la raíz del proyecto
cp .env.example .env
# Editar .env con tu configuración (ver sección de Variables de Entorno)
```

3. **Generar secreto JWT**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copiar el resultado a JWT_SECRET en .env
```

4. **Iniciar todos los servicios**
```bash
docker-compose up -d
```

Esto iniciará:
- MariaDB (puerto 3306)
- InfluxDB (puerto 8086)
- Mosquitto MQTT (puertos 1883, 9001)
- Node-RED (puerto 1880)
- Grafana (puerto 3000)
- Telegraf
- Backend Node.js (puerto 3000)
- Frontend Nginx (puerto 5000)

5. **Verificar servicios**
```bash
docker-compose ps
docker-compose logs -f iot-backend  # Ver logs del backend
```

#### Opción 2: Desarrollo Local (Sin Docker)

1. **Clonar y configurar backend**
```bash
cd C-Prototipo/backend
npm install
cp .env.example .env
# Editar .env con tu configuración
```

2. **Configurar base de datos**
```bash
# Iniciar MariaDB (usar Docker o instalación local)
docker-compose up -d mariadb

# La base de datos se inicializará automáticamente con init/01-init.sql
```

3. **Configurar broker MQTT**
```bash
# Iniciar Mosquitto
docker-compose up -d mosquitto
```

4. **Generar secreto JWT**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

5. **Iniciar servidor de desarrollo**
```bash
npm start
```

### Desarrollo del Frontend

El frontend se sirve de forma estática y no requiere proceso de construcción. Simplemente sirve el directorio `frontend/public` con cualquier servidor HTTP.

```bash
# Usando Python
cd frontend/public
python -m http.server 8080

# Usando Node.js
npx serve frontend/public -p 8080
```

## Consideraciones de Seguridad

### Seguridad de Autenticación
- Los tokens JWT usan algoritmo HS256 con secreto de 64 caracteres
- Los tokens tienen expiración corta (15 minutos)
- Los tokens ID de Google se validan contra JWKS de Google
- Las conexiones WebSocket requieren tokens JWT válidos

### Seguridad de Datos
- Middleware Helmet para headers de seguridad
- Configuración CORS para solicitudes de origen cruzado
- Validación de entrada con esquemas Joi
- Prevención de inyección SQL con consultas parametrizadas

### Seguridad de Red
- MQTT soporta autenticación usuario/contraseña
- Las conexiones WebSocket usan autenticación JWT
- HTTPS recomendado para producción (configurar en proxy inverso)

## Optimizaciones de Rendimiento

### Optimizaciones del Backend
- Pool de conexiones para conexiones de base de datos MariaDB
- Buffers circulares para datos de temperatura, humedad y CO2 (previene pérdidas de memoria)
- Gestión de conexiones WebSocket con limpieza automática
- Nivel QoS 1 MQTT para entrega confiable de mensajes
- Procesamiento asíncrono de mensajes MQTT
- Almacenamiento dual: MariaDB (datos estructurados) + InfluxDB (time-series)
- Índices en tablas de base de datos para consultas rápidas

### Optimizaciones del Frontend
- Renderizado de gráficos basado en Canvas para rendimiento (temperatura, humedad, CO2)
- Visualización SVG eficiente de dispositivos
- Service worker para capacidades offline y PWA
- Manipulación DOM eficiente con utilidades personalizadas
- Carga diferida de componentes de página (lazy loading)
- Actualización selectiva de widgets (solo cuando cambian datos)
- Debouncing en actualizaciones de gráficos
- Caché de configuraciones en localStorage

## Monitoreo y Registro

### Registros de Aplicación
- Registro de solicitudes HTTP Morgan
- Registro de estado de conexión MQTT
- Seguimiento de conexiones WebSocket
- Registro de errores con stack traces

### Verificaciones de Salud
```
GET /health
Response: { "ok": true }
```

### Métricas Disponibles
- Estado de conexión MQTT (conectado/desconectado)
- Cantidad de suscriptores WebSocket activos
- Cantidad de datos en buffer (temperatura, humedad, CO2)
- Estado del pool de conexiones de base de datos MariaDB
- Estadísticas de gateways, endpoints y sensores
- Contadores de mensajes MQTT recibidos por tópico
- Estado de batería de endpoints
- Alertas activas por tipo


## Solución de Problemas

### Problemas Comunes

1. **Falló la Conexión MQTT**
   - Verificar configuración de host/puerto del broker en variables de entorno
   - Verificar que el contenedor Mosquitto esté corriendo: `docker-compose ps mosquitto`
   - Verificar conectividad de red: `docker-compose logs mosquitto`
   - Verificar credenciales de autenticación MQTT (si están configuradas)
   - Verificar que los tópicos estén correctamente configurados en `MQTT_TOPICS`

2. **Token JWT Inválido**
   - Verificar que `JWT_SECRET` esté configurado correctamente (64 caracteres hexadecimales)
   - Verificar expiración del token (por defecto 15 minutos)
   - Asegurar que el Google Client ID sea correcto
   - Limpiar cookies del navegador y volver a iniciar sesión

3. **Error de Conexión a Base de Datos**
   - Verificar credenciales de base de datos en variables de entorno
   - Verificar estado del servicio MariaDB: `docker-compose ps mariadb`
   - Verificar logs de MariaDB: `docker-compose logs mariadb`
   - Asegurar que la base de datos existe y se inicializó correctamente
   - Verificar que el script `init/01-init.sql` se ejecutó

4. **Falló la Conexión WebSocket**
   - Verificar validez del token JWT en la URL de conexión
   - Verificar configuración de URL WebSocket (debe incluir el token)
   - Verificar configuración del firewall
   - Verificar logs del backend para errores de WebSocket

5. **No se Reciben Datos de Sensores**
   - Verificar que los dispositivos estén publicando a los tópicos correctos
   - Verificar logs MQTT en el dashboard de la aplicación
   - Verificar que `mqttService` esté conectado y suscrito a los tópicos
   - Verificar el estado del sistema en `/api/gateway/status`

6. **Problemas con InfluxDB**
   - Verificar que InfluxDB esté corriendo: `docker-compose ps influxdb`
   - Verificar credenciales de InfluxDB
   - Verificar que la base de datos existe: `curl http://localhost:8086/query?db=iot_data`

7. **Problemas de Docker**
   - Verificar que todos los contenedores estén corriendo: `docker-compose ps`
   - Ver logs de errores: `docker-compose logs`
   - Reiniciar servicios: `docker-compose restart`
   - Reconstruir imágenes: `docker-compose build --no-cache`

### Modo Debug
Configurar `NODE_ENV=development` para registro detallado y mensajes de error.

## Contribución

### Estilo de Código
- Usar características ES6+
- Seguir patrones async/await
- Implementar manejo apropiado de errores
- Agregar comentarios JSDoc para funciones
- Usar nombres de variables significativos

### Pruebas
- Pruebas unitarias para funciones de servicio
- Pruebas de integración para endpoints API
- Pruebas de comunicación WebSocket
- Pruebas de procesamiento de datos MQTT

## Arquitectura Docker

El proyecto utiliza Docker Compose para orquestar múltiples servicios:

```
C-Prototipo/
├── docker-compose.yml          # Configuración de todos los servicios
├── backend.Dockerfile           # Imagen del backend Node.js
├── frontend.Dockerfile         # Imagen del frontend Nginx
├── init/
│   └── 01-init.sql             # Script de inicialización de MariaDB
└── services/
    └── silo/
        ├── mosquitto/          # Configuración de broker MQTT
        ├── mariadb/            # Datos persistentes de MariaDB
        ├── influxdb/           # Datos persistentes de InfluxDB
        ├── nodered/            # Flujos de Node-RED
        ├── grafana/            # Dashboards de Grafana
        └── telegraf/           # Configuración de Telegraf
```

### Servicios Principales

- **iot-backend**: Backend Node.js/Express en puerto 3000
- **iot-frontend**: Frontend Nginx sirviendo archivos estáticos en puerto 5000
- **silo-mariadb**: Base de datos relacional
- **silo-influxdb**: Base de datos time-series
- **silo-mosquitto**: Broker MQTT
- **silo-nodered**: Node-RED para flujos IoT
- **silo-grafana**: Dashboards de visualización
- **silo-telegraf**: Agente de recopilación de métricas

### Volúmenes Persistentes

Los datos se persisten en:
- `./services/silo/mariadb/data` - Datos de MariaDB
- `./services/silo/influxdb/data` - Datos de InfluxDB
- `./services/silo/mosquitto/data` - Datos de Mosquitto
- `./services/silo/nodered/data` - Flujos de Node-RED
- `./services/silo/grafana/data` - Dashboards de Grafana

## Licencia

Este proyecto es parte del curso de Desarrollo IoT ISPC 2025.