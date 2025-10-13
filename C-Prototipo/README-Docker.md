# 🚀 TST-DA IoT WebApp - Docker Compose Stack

Sistema completo de IoT con gestión de usuarios, MQTT, base de datos y monitoreo en tiempo real para el proyecto TST-DA.

## 📋 Servicios Incluidos

- **Frontend**: Nginx con aplicación web React/Vanilla JS
- **Backend**: Node.js con Express y WebSocket
- **MariaDB**: Base de datos principal para usuarios y configuración
- **InfluxDB**: Base de datos de series temporales para datos IoT
- **Telegraf**: Agente de recolección de datos
- **Mosquitto**: Broker MQTT para comunicación IoT
- **Redis**: Cache y sesiones
- **Nginx Proxy Manager**: Gestión de proxies y SSL

## 🚀 Inicio Rápido

### 1. Clonar y preparar
```bash
git clone <tu-repo>
cd C-Prototipo
```

### 2. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables según tu entorno
nano .env
```

### 3. Desplegar con script automático
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. O desplegar manualmente
```bash
# Crear directorios necesarios
mkdir -p certs data/{mariadb,influxdb,mosquitto,redis,npm}

# Construir e iniciar servicios
docker-compose up -d --build
```

## 🔧 Configuración

### Variables de Entorno Principales

```env
# Base de datos
DB_ROOT_PASSWORD=rootpassword123
DB_NAME=TST-DA
DB_USER=tst_da_user
DB_PASS=tst_da_password_2024

# InfluxDB
INFLUX_USER=admin
INFLUX_PASSWORD=adminpassword123
INFLUX_ORG=tst-da-org
INFLUX_BUCKET=tst-da-datos

# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id_aqui

# JWT
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro
```

### Certificados SSL

Coloca tus certificados SSL en el directorio `./certs/`:
- `fullchain.pem` - Certificado completo
- `privkey.pem` - Clave privada

## 🌐 Acceso a Servicios

| Servicio | URL | Puerto | Descripción |
|----------|-----|--------|-------------|
| Frontend | https://localhost | 443 | Aplicación web principal |
| Backend API | https://localhost/api | 443 | API REST y WebSocket |
| Nginx Proxy Manager | http://localhost:81 | 81 | Gestión de proxies |
| InfluxDB | http://localhost:8086 | 8086 | Base de datos temporal |
| MariaDB | localhost:3306 | 3306 | Base de datos principal |
| Mosquitto MQTT | localhost:1883 | 1883 | Broker MQTT |
| Mosquitto WebSocket | localhost:9001 | 9001 | MQTT WebSocket |
| Redis | localhost:6379 | 6379 | Cache y sesiones |

## 📊 Monitoreo y Logs

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend
docker-compose logs -f mariadb
docker-compose logs -f mosquitto
```

### Estado de servicios
```bash
docker-compose ps
```

### Métricas de recursos
```bash
docker stats
```

## 🔄 Comandos Útiles

### Gestión de servicios
```bash
# Iniciar todos los servicios
docker-compose up -d

# Detener todos los servicios
docker-compose down

# Reiniciar servicio específico
docker-compose restart backend

# Reconstruir servicio
docker-compose up -d --build backend
```

### Base de datos
```bash
# Conectar a MariaDB
docker-compose exec mariadb mysql -u root -p

# Conectar a InfluxDB CLI
docker-compose exec influxdb influx
```

### MQTT
```bash
# Publicar mensaje de prueba
docker-compose exec mosquitto mosquitto_pub -h localhost -t "test/topic" -m "Hello MQTT"

# Suscribirse a topic
docker-compose exec mosquitto mosquitto_sub -h localhost -t "vittoriodurigutti/+/+"
```

## 🛠️ Desarrollo

### Modo desarrollo
```bash
# Levantar solo servicios de infraestructura
docker-compose up -d mariadb influxdb mosquitto redis

# Desarrollar backend localmente
cd backend
npm install
npm run dev

# Desarrollar frontend localmente
cd frontend
# Usar live-server o tu servidor de desarrollo preferido
```

### Debugging
```bash
# Entrar a contenedor
docker-compose exec backend sh
docker-compose exec mariadb bash

# Ver logs detallados
docker-compose logs --tail=100 -f backend
```

## 🔒 Seguridad

### Configuración de producción
1. Cambiar todas las contraseñas por defecto
2. Configurar certificados SSL válidos
3. Restringir acceso a puertos de administración
4. Configurar firewall
5. Usar secrets de Docker para datos sensibles

### Variables sensibles
```bash
# Crear archivo de secrets
echo "mi_password_super_secreto" | docker secret create db_password -
echo "mi_jwt_secret_muy_largo" | docker secret create jwt_secret -
```

## 📈 Escalabilidad

### Escalar servicios
```bash
# Escalar backend
docker-compose up -d --scale backend=3

# Usar load balancer
# Configurar Nginx Proxy Manager para balancear carga
```

### Backup
```bash
# Backup de MariaDB
docker-compose exec mariadb mysqldump -u root -p iot_webapp > backup.sql

# Backup de InfluxDB
docker-compose exec influxdb influx backup /backup
```

## 🐛 Troubleshooting

### Problemas comunes

1. **Servicios no inician**
   ```bash
   docker-compose logs [servicio]
   docker system prune -f
   ```

2. **Error de conexión a base de datos**
   - Verificar variables de entorno
   - Esperar a que MariaDB esté completamente iniciado

3. **Certificados SSL**
   - Verificar que los archivos estén en `./certs/`
   - Verificar permisos de archivos

4. **Puertos ocupados**
   ```bash
   # Ver qué proceso usa el puerto
   netstat -tulpn | grep :80
   # Cambiar puertos en docker-compose.yml
   ```

### Logs importantes
```bash
# Verificar health checks
docker-compose ps

# Logs de inicio
docker-compose logs --tail=50 mariadb
docker-compose logs --tail=50 backend
```

## 📚 Documentación Adicional

- [Docker Compose](https://docs.docker.com/compose/)
- [MariaDB](https://mariadb.org/documentation/)
- [InfluxDB](https://docs.influxdata.com/influxdb/)
- [Mosquitto MQTT](https://mosquitto.org/documentation/)
- [Nginx Proxy Manager](https://nginxproxymanager.com/)

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
