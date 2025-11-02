# Aplicación Web IoT - Guía de Usuario

![Pantalla de Inicio de Sesión](D-Presentacion/Capturas-APP/Pantalla%20de%20ingreso.png)

## Descripción General

Este sistema te permite monitorear datos de temperatura, humedad y CO2 de sensores IoT en tiempo real, gestionar configuraciones del sistema y controlar dispositivos según tu rol asignado. La aplicación proporciona una interfaz web moderna para visualizar datos de sensores y gestionar tu infraestructura IoT de los elementos desplegados en los silos de cereales, todo como parte del proyecto Intertecnicatura del ISPC.

La aplicación utiliza una arquitectura jerárquica de dispositivos: **Gateway → Endpoints → Sensores**, donde cada gateway gestiona múltiples endpoints, y cada endpoint contiene varios sensores que miden variables ambientales.

## Comenzando

### Acceder a la Aplicación

1. **Abre tu navegador web** y navega a la URL de la aplicación
2. **Inicia sesión con Google** usando tu cuenta de Google
3. **Espera la autenticación** - el sistema asignará automáticamente un rol basado en tu email
4. **Explora el dashboard** para ver gráficos de temperatura en tiempo real

### Primer Inicio de Sesión

Cuando inicies sesión por primera vez, verás:
- **Dashboard** con gráficos de temperatura en tiempo real
- **Menú de navegación** basado en tu rol asignado
- **Indicadores de estado del sistema**
- **Opciones de configuración** (si tienes los permisos apropiados)

## Roles de Usuario y Permisos

El sistema utiliza tres roles distintos, cada uno con diferentes niveles de acceso:

### Tabla de Permisos por Rol

| Funcionalidad | 👑 Administrador | ⚙️ Operador | 👁️ Visualizador |
|---------------|:----------------:|:-----------:|:----------------:|
| **Visualización de Datos** |
| Ver datos de temperatura | ✅ | ✅ | ✅ |
| Ver estadísticas | ✅ | ✅ | ✅ |
| Ver gráficos en tiempo real | ✅ | ✅ | ✅ |
| Acceder al dashboard | ✅ | ✅ | ✅ |
| **Configuración General** |
| Acceder a configuración general | ✅ | ✅ | ❌ |
| Modificar preferencias de visualización | ✅ | ✅ | ❌ |
| Configurar notificaciones básicas | ✅ | ✅ | ❌ |
| **Configuración Avanzada** |
| Acceder a configuración avanzada | ✅ | ❌ | ❌ |
| Modificar umbrales de temperatura | ✅ | ❌ | ❌ |
| Configurar alertas de calor/frío | ✅ | ❌ | ❌ |
| Modificar intervalos de gráficos | ✅ | ❌ | ❌ |
| **Gestión MQTT** |
| Ver estado de conexión MQTT | ✅ | ✅ | ❌ |
| Controlar configuraciones MQTT | ✅ | ❌ | ❌ |
| Reiniciar conexiones MQTT | ✅ | ❌ | ❌ |
| Modificar tópicos MQTT | ✅ | ❌ | ❌ |
| **Administración del Sistema** |
| Limpiar cache de datos | ✅ | ❌ | ❌ |
| Gestionar mantenimiento | ✅ | ❌ | ❌ |
| Ver logs detallados | ✅ | ✅ | ❌ |
| Exportar/importar configuración | ✅ | ❌ | ❌ |
| **Control de Dispositivos** |
| Acceder a paneles de control | ✅ | ✅ | ❌ |
| Enviar comandos a dispositivos | ✅ | ✅ | ❌ |
| **Información del Sistema** |
| Ver información básica | ✅ | ✅ | ✅ |
| Ver información avanzada | ✅ | ✅ | ❌ |
| Ver logs operacionales | ✅ | ✅ | ❌ |

### Descripción de Roles

#### 👑 Administrador (Admin)
**Acceso y control completo del sistema**
- Control total sobre todas las funcionalidades
- Puede modificar configuraciones críticas del sistema
- Acceso a funciones de mantenimiento y administración
- Responsable de la gestión general del sistema IoT

#### ⚙️ Operador (Action)
**Control de dispositivos y tareas operacionales**
- Puede controlar dispositivos y operaciones del sistema
- Acceso limitado a configuraciones avanzadas
- Puede monitorear y operar dispositivos IoT
- Ideal para personal técnico operativo

#### 👁️ Visualizador (Readonly)
**Acceso solo de lectura para monitoreo**
- Solo puede ver datos y estadísticas
- No puede modificar configuraciones
- Ideal para supervisores y personal de monitoreo
- Acceso limitado a información básica

## Características del Dashboard

![Dashboard Principal](D-Presentacion/Capturas-APP/dashboard-dashboard-sensor.png)

El dashboard principal es el centro de control de tu aplicación IoT. Proporciona una visión completa del estado del sistema y permite monitorear todos los sensores en tiempo real.

### Monitoreo de Sensores en Tiempo Real

El dashboard principal muestra:

**📊 Visualización de Sensores**
- Lecturas de temperatura, humedad y CO2 en vivo desde sensores
- Visualización de datos históricos con gráficos interactivos
- Rangos de tiempo configurables
- Soporte para múltiples sensores por endpoint
- Visualización jerárquica de Gateway → Endpoints → Sensores

![Estructura IoT](D-Presentacion/Capturas-APP/dashboard-estructura-IoT.png)

**📈 Panel de Estadísticas**
- Valores actuales de cada sensor
- Promedios y estadísticas de cada tipo de medición
- Valores mínimo/máximo
- Cantidad de puntos de datos
- Timestamp de última actualización

![Estado del Sistema](D-Presentacion/Capturas-APP/dashboard-estadosistema.png)

**🔗 Estado de Conexión**
- Estado de conexión del broker MQTT
- Indicador de conexión WebSocket
- Estado de transmisión de datos
- Indicadores de salud del sistema
- Estado de gateways, endpoints y sensores

**📡 Logs MQTT en Tiempo Real**
- Visualización de mensajes MQTT recibidos
- Filtrado por tipo de mensaje (gateway, endpoint, sensor)
- Timestamps precisos de cada mensaje
- Control de auto-scroll y expansión de logs

![Logs MQTT](D-Presentacion/Capturas-APP/dashboard-logs.png)

### Gestión de Dispositivos

**Vista General de Dispositivos**
La página de dispositivos muestra la estructura completa del sistema:

![Vista General de Dispositivos](D-Presentacion/Capturas-APP/dispositivos-estadogeneral.png)

- **Jerarquía visual**: Gateway → Endpoints → Sensores
- **Estadísticas generales**: Total de gateways, endpoints y sensores
- **Estado en tiempo real**: Indicadores de estado en línea/fuera de línea
- **Información detallada**: Ubicación, estado de batería, y estado de conexión LoRa

**Histórico de Sensores**
Cada dispositivo permite visualizar su histórico de datos:

![Histórico de Sensor](D-Presentacion/Capturas-APP/dispositivo-historico-sensor.png)

- **Datos desde MariaDB**: Últimos registros procesados de sensores
- **Datos desde InfluxDB**: Mensajes MQTT históricos de las últimas 24 horas
- **Tabs intercambiables**: Cambia entre ambas fuentes de datos

### Controles de Gráficos

**Selección de Rango de Tiempo**
- Actualizaciones en tiempo real (intervalos configurables desde 15 segundos)
- Visualización de datos históricos
- Puntos de datos personalizables (10-1000 puntos)
- Gráficos con escala automática

**Visualización de Datos**
- Gráficos de líneas suaves para temperatura, humedad y CO2
- Zonas de valores codificadas por colores (normal, alerta, crítico)
- Tooltips interactivos con valores precisos
- Diseño responsivo para dispositivos móviles
- Visualización SVG de dispositivos con posición de sensores

## Gestión de Configuración

### Configuración General (Todos los Usuarios Autenticados)

![Página de Configuración](D-Presentacion/Capturas-APP/Configuracion.png)

Accede a la página **Configuración** para ver y modificar configuraciones básicas:

**Información del Sistema**
- Versión de la aplicación
- Fecha de última actualización
- Estado del sistema
- Estadísticas de cantidad de datos

**Configuraciones de Visualización**
- Unidad de temperatura (Celsius/Fahrenheit)
- Intervalos de actualización de gráficos (15 segundos mínimo)
- Puntos máximos de datos en gráficos (10-1000)
- Preferencias de visualización

**Configuración de Notificaciones**
- Permitir notificaciones del navegador
- Alertas sonoras
- Prueba de notificaciones

### Configuración Avanzada (Solo Administradores)

Accede a la página **Configuración Avanzada** para configuraciones a nivel del sistema:

**Umbrales de Sensores**
Configura los valores límite para generar alertas automáticas:

```
Temperatura:
- Mínima Normal: 0°C (configurable)
- Máxima Normal: 50°C (configurable)
- Mínima Crítica: < Mínima Normal
- Máxima Crítica: > Máxima Normal

Humedad:
- Mínima: 20% (configurable)
- Máxima: 80% (configurable)

Batería:
- Umbral Bajo: Configurable (0-100%)
```

**Configuración de Gráficos**
- Intervalo de actualización: 15 segundos (mínimo) - 5 minutos
- Puntos de datos: 10 - 1000
- Escala automática: Activada/Desactivada
- Modo tiempo real: Activado/Desactivado

**Configuraciones MQTT**
- Estado de conexión del broker
- Gestión de tópicos MQTT suscritos
- Niveles QoS (0, 1, 2)
- Reinicio de conexión MQTT
- Monitoreo de mensajes en tiempo real

**Configuraciones de Notificaciones**
- Notificaciones del navegador
- Alertas sonoras
- Gestión de alertas activas
- Preferencias de logging

**Configuraciones del Sistema**
- Limpieza de cache de datos
- Modo de mantenimiento
- Configuraciones de respaldo
- Niveles de log
- Monitoreo de rendimiento

## Integración MQTT

### Entendiendo los Tópicos MQTT

El sistema se suscribe a tópicos MQTT para recibir datos de sensores siguiendo una estructura jerárquica:

**Tópicos del Sistema:**
- `gateway/gateway` - Estado y datos de gateways LoRa
- `gateway/endpoint` - Estado y datos de endpoints
- `gateway/sensor` - Lecturas de sensores (temperatura, humedad, CO2)
- `temperature` - Mensajes de temperatura (compatibilidad)
- `co2` - Mensajes de CO2
- `humidity` - Mensajes de humedad

### Formatos de Datos

**Formato JSON para Gateways:**
```json
{
  "id": "gw001",
  "lora_status": "ok",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Formato JSON para Endpoints:**
```json
{
  "id": "ep001",
  "gateway_id": "gw001",
  "status": "ok",
  "battery": 85,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Formato JSON para Sensores:**
```json
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

**Formato Numérico Simple (compatibilidad):**
```
23.5
```

### Gestión de Conexión

**Características Automáticas:**
- Reconexión automática en caso de pérdida de conexión
- Monitoreo de salud de conexión
- Validación de datos y manejo de errores
- Actualizaciones de estado en tiempo real

## Navegación y Páginas

![Menú de Navegación](D-Presentacion/Capturas-APP/tab-menu.png)

La aplicación incluye las siguientes páginas principales:

- **Dashboard**: Panel principal con visualización de sensores en tiempo real
- **Dispositivos**: Vista jerárquica de todos los dispositivos IoT
- **Configuración**: Configuración general del sistema
- **Configuración Avanzada**: Configuraciones administrativas (solo administradores)
- **Sobre Nosotros**: Información del proyecto

![Página Sobre Nosotros](D-Presentacion/Capturas-APP/sobre-nosotros.png)

## Solución de Problemas

### Problemas Comunes y Soluciones

**🔴 No se Muestran Datos de Sensores**

*Posibles causas:*
- Broker MQTT no conectado
- Ningún sensor/gateway publicando datos
- Configuración incorrecta de tópicos
- Dispositivo no seleccionado en el dashboard

*Soluciones:*
1. Verificar estado de conexión MQTT en el dashboard (sección de logs)
2. Verificar que los gateways, endpoints y sensores estén publicando a los tópicos correctos (`gateway/gateway`, `gateway/endpoint`, `gateway/sensor`)
3. Seleccionar un dispositivo en el selector de dispositivos del dashboard
4. Verificar la página "Dispositivos" para ver el estado de todos los dispositivos
5. Contactar al administrador para verificar configuración de tópicos

**🔴 Los Gráficos No se Actualizan**

*Posibles causas:*
- Conexión WebSocket perdida
- Problemas de cache del navegador
- Errores de JavaScript
- Dispositivo sin datos recientes

*Soluciones:*
1. Verificar el estado de conexión WebSocket en el dashboard
2. Verificar los logs MQTT para confirmar recepción de mensajes
3. Actualizar la página
4. Verificar consola del navegador para errores (F12 → Console)
5. Limpiar cache del navegador
6. Probar con un navegador diferente
7. Verificar que haya un dispositivo seleccionado y que esté recibiendo datos

**🔴 No Puedo Acceder a la Configuración**

*Posibles causas:*
- Permisos insuficientes
- Sesión expirada
- Rol no asignado correctamente

*Soluciones:*
1. Cerrar sesión y volver a iniciar
2. Contactar al administrador para verificar tu rol
3. Verificar que tu email esté en la lista blanca apropiada

**🔴 Problemas de Inicio de Sesión**

*Posibles causas:*
- Problemas de autenticación de Google
- Problemas de conectividad de red
- Compatibilidad del navegador

*Soluciones:*
1. Verificar conexión a internet
2. Probar modo incógnito/navegación privada
3. Limpiar cookies del navegador
4. Probar con un navegador diferente
5. Contactar al administrador del sistema

### Obtener Ayuda

**Para Problemas Técnicos:**
- Verificar la consola del navegador (F12) para mensajes de error
- Tomar capturas de pantalla de cualquier mensaje de error
- Anotar la hora cuando ocurren los problemas
- Contactar a tu administrador del sistema

**Para Problemas de Acceso:**
- Verificar que tu cuenta de Google esté funcionando
- Verificar que tu email esté en la lista blanca del sistema
- Contactar a tu administrador para asignación de roles

## Mejores Prácticas

### Monitoreo de Datos

**Monitoreo Regular:**
- Revisar el dashboard diariamente para tendencias de temperatura
- Monitorear indicadores de estado de conexión
- Revisar alertas de temperatura oportunamente

**Respuesta a Alertas:**
- Responder a alertas de temperatura dentro del período de cooldown
- Documentar cualquier anomalía de temperatura
- Reportar problemas persistentes a los administradores

### Uso del Sistema

**Rendimiento:**
- Cerrar pestañas del navegador no utilizadas para mejorar el rendimiento
- Usar navegadores modernos (Chrome, Firefox, Safari, Edge)
- Evitar ejecutar múltiples instancias de la aplicación

**Seguridad:**
- Cerrar sesión cuando termines de usar la aplicación
- No compartir credenciales de tu cuenta de Google
- Reportar cualquier actividad sospechosa a los administradores

## Uso Móvil

La aplicación es completamente responsiva y funciona en dispositivos móviles:

**Características Móviles:**
- Interfaz amigable al tacto
- Gráficos y gráficos responsivos
- Menú de navegación optimizado
- Controles específicos para móviles

**Consejos Móviles:**
- Usar modo horizontal para mejor visualización de gráficos
- Pellizcar para hacer zoom en gráficos
- Navegación por deslizamiento para navegación más fácil

## Requisitos del Sistema

### Compatibilidad del Navegador
- **Chrome** 90+ (Recomendado)
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Requisitos de Red
- Conexión estable a internet
- Acceso a servicios de Google
- Conectividad al broker MQTT
- Soporte WebSocket

### Requisitos del Dispositivo
- **Escritorio:** Cualquier computadora moderna
- **Móvil:** iOS 12+ o Android 8+
- **Tablet:** iPadOS 12+ o Android 8+

## Información de Contacto

**Administrador del Sistema:** Contacta a tu administrador de TI local para:
- Asignaciones de roles
- Cambios de configuración del sistema
- Soporte técnico
- Problemas de acceso

**Contactos de Emergencia:** Para problemas críticos del sistema, contacta a tu equipo de soporte de emergencia designado.

---

*Esta aplicación es parte del curso de Desarrollo IoT ISPC 2025. Para documentación técnica, ver README-TECNICO.md*