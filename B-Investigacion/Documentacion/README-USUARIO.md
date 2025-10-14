# Aplicación Web IoT - Guía de Usuario

## Descripción General

Este sistema te permite monitorear LOS datos de temperatura y humedad, (probablmente tambien CO2 en caso de implementarlo) de sensores IoT en tiempo real, gestionar configuraciones del sistema y controlar dispositivos según tu rol asignado. La aplicación proporciona una interfaz web moderna para visualizar datos de sensores y gestionar tu infraestructura IoT de los elementos desplegados en los silos de cereales, todo como parte del proyecto Intertecnicatura del ISPC.

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

### Monitoreo de Temperatura en Tiempo Real

El dashboard principal muestra:

**📊 Gráfico de Temperatura**
- Lecturas de temperatura en vivo desde sensores
- Visualización de datos históricos
- Rangos de tiempo configurables
- Soporte para múltiples sensores

**📈 Panel de Estadísticas**
- Temperatura actual
- Temperatura promedio
- Valores mínimo/máximo
- Cantidad de puntos de datos
- Timestamp de última actualización

**🔗 Estado de Conexión**
- Estado de conexión del broker MQTT
- Indicador de conexión WebSocket
- Estado de transmisión de datos
- Indicadores de salud del sistema

### Controles de Gráficos

**Selección de Rango de Tiempo**
- Actualizaciones en tiempo real (intervalos de 1 segundo)
- Visualización de datos históricos
- Puntos de datos personalizables
- Gráficos con escala automática

**Visualización de Datos**
- Gráficos de líneas suaves
- Zonas de temperatura codificadas por colores
- Tooltips interactivos
- Diseño responsivo para dispositivos móviles

## Gestión de Configuración

### Configuración General (Todos los Usuarios Autenticados)

Accede a la página **Configuración** para ver y modificar configuraciones básicas:

**Información del Sistema**
- Versión de la aplicación
- Fecha de última actualización
- Estado del sistema
- Estadísticas de cantidad de datos

**Configuraciones de Visualización**
- Unidad de temperatura (Celsius/Fahrenheit)
- Intervalos de actualización de gráficos
- Puntos máximos de datos en gráficos
- Preferencias de visualización

### Configuración Avanzada (Solo Administradores)

Accede a la página **Configuración Avanzada** para configuraciones a nivel del sistema:

**Umbrales de Temperatura**
(valor generales, despues lo adaptaremos segun llegemos a concenso con el resto del equipo y segun la documentacion y requerimientos de TS de AGRO)
```
Rango Normal: 18°C - 25°C
Alerta de Calor: Por encima de 30°C
Alerta de Frío: Por debajo de 5°C
```

**Configuración de Gráficos**
- Intervalo de actualización: 100ms - 60s
- Puntos de datos: 10 - 1000
- Escala automática: Activada/Desactivada
- Modo tiempo real: Activado/Desactivado

**Configuraciones MQTT**
- Suscripciones a tópicos
- Niveles QoS (0, 1, 2)
- Timeout de conexión
- Intentos de reconexión

**Configuraciones de Notificaciones**
- Notificaciones por email
- Períodos de cooldown de alertas
- Preferencias de logging
- Modo debug

**Configuraciones del Sistema**
- Modo de mantenimiento
- Configuraciones de respaldo
- Niveles de log
- Monitoreo de rendimiento

## Integración MQTT

### Entendiendo los Tópicos MQTT

El sistema se suscribe a tópicos MQTT para recibir datos de sensores:

**Tópicos por Defecto:**
(Los de prueba claramente, despues segun lo definan back y embebido, ajustaremos a los existentes)
- `vittoriodurigutti/prueba` - Datos de prueba
- `vittoriodurigutti/temperature` - Lecturas de temperatura
- `vittoriodurigutti/sensor/+` - Todos los datos de sensores

### Formatos de Datos

**Formato JSON (Recomendado):**
(tambien. generico y lo adaptaremos segun back y embebdio)
```json
{
  "temperature": 23.5,
  "humidity": 65.2,
  "sensor_id": "temp_001",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Formato Numérico Simple:**
```
23.5
```

### Gestión de Conexión

**Características Automáticas:**
- Reconexión automática en caso de pérdida de conexión
- Monitoreo de salud de conexión
- Validación de datos y manejo de errores
- Actualizaciones de estado en tiempo real

## Solución de Problemas

### Problemas Comunes y Soluciones

**🔴 No se Muestran Datos de Temperatura**

*Posibles causas:*
- Broker MQTT no conectado
- Ningún sensor publicando datos
- Configuración incorrecta de tópicos

*Soluciones:*
1. Verificar estado de conexión MQTT en el dashboard
2. Verificar que el sensor esté publicando al tópico correcto
3. Contactar al administrador para verificar configuración de tópicos

**🔴 Los Gráficos No se Actualizan**

*Posibles causas:*
- Conexión WebSocket perdida
- Problemas de cache del navegador
- Errores de JavaScript

*Soluciones:*
1. Actualizar la página
2. Verificar consola del navegador para errores
3. Limpiar cache del navegador
4. Probar con un navegador diferente

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