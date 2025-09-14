#!/bin/bash
# =========================
# Script de despliegue Docker Compose
# =========================

set -e

echo "🚀 Iniciando despliegue de IoT WebApp con Docker Compose"
echo "=================================================="

# Verificar que Docker y Docker Compose estén instalados
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Archivo .env creado. Por favor revisa y ajusta las variables según tu entorno."
    else
        echo "⚠️  Archivo .env.example no encontrado. Creando .env básico..."
        cat > .env << EOF
# Variables básicas para TST-DA
DB_ROOT_PASSWORD=rootpassword123
DB_NAME=TST-DA
DB_USER=tst_da_user
DB_PASS=tst_da_password_2024
INFLUX_USER=admin
INFLUX_PASSWORD=adminpassword123
INFLUX_ORG=tst-da-org
INFLUX_BUCKET=tst-da-datos
INFLUX_TOKEN=tst-da-token-12345678901234567890123456789012
REDIS_PASSWORD=redispassword123
GOOGLE_CLIENT_ID=113014965393-9t3h4eg2jr4aj7mfs4q78kkajln16m79.apps.googleusercontent.com
JWT_SECRET=2fe600301bc1e4e129c5519d32bed987cb521c3281b5e40027e37fee64abd7ae706f56388a8f1c507889b09b9ef1de3822f232bc798b03680f7bb943849910fc
EOF
    fi
fi

# Crear directorio de certificados si no existe
if [ ! -d certs ]; then
    echo "📁 Creando directorio de certificados..."
    mkdir -p certs
    echo "⚠️  IMPORTANTE: Coloca tus certificados SSL en el directorio ./certs/"
    echo "   - fullchain.pem (certificado completo)"
    echo "   - privkey.pem (clave privada)"
fi

# Crear directorios de datos si no existen
echo "📁 Creando directorios de datos..."
mkdir -p data/{mariadb,influxdb,mosquitto,redis,npm}

# Construir imágenes
echo "🔨 Construyendo imágenes Docker..."
docker-compose build --no-cache

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose ps

# Mostrar logs de servicios críticos
echo "📋 Mostrando logs de servicios críticos..."
echo "=================================================="

echo "🗄️  MariaDB logs:"
docker-compose logs --tail=10 mariadb

echo ""
echo "📊 InfluxDB logs:"
docker-compose logs --tail=10 influxdb

echo ""
echo "📡 Mosquitto logs:"
docker-compose logs --tail=10 mosquitto

echo ""
echo "🔧 Backend logs:"
docker-compose logs --tail=10 backend

echo ""
echo "🌐 Frontend logs:"
docker-compose logs --tail=10 frontend

echo ""
echo "🎯 Nginx Proxy Manager logs:"
docker-compose logs --tail=10 nginx-proxy-manager

echo ""
echo "=================================================="
echo "✅ Despliegue completado!"
echo ""
echo "🌐 Servicios disponibles:"
echo "   - Frontend: https://localhost (o tu dominio configurado)"
echo "   - Backend API: https://localhost/api"
echo "   - Nginx Proxy Manager: http://localhost:81"
echo "   - InfluxDB: http://localhost:8086"
echo "   - MariaDB: localhost:3306"
echo "   - Mosquitto MQTT: localhost:1883"
echo "   - Mosquitto WebSocket: localhost:9001"
echo "   - Redis: localhost:6379"
echo ""
echo "🔑 Credenciales por defecto:"
echo "   - InfluxDB: admin / adminpassword123"
echo "   - MariaDB root: rootpassword123"
echo "   - MariaDB user: iot_user / iot_password123"
echo "   - Redis: redispassword123"
echo ""
echo "📝 Para ver logs en tiempo real:"
echo "   docker-compose logs -f [nombre_servicio]"
echo ""
echo "🛑 Para detener todos los servicios:"
echo "   docker-compose down"
echo ""
echo "🔄 Para reiniciar un servicio específico:"
echo "   docker-compose restart [nombre_servicio]"
