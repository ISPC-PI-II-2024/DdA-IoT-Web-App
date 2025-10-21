# ==========================
# Script para levantar backend y frontend en local (modo dev)
# Ejecuten este comando antes para ver si tiene habilitados los permisos de ejecución:
#   chmod +x levantar.sh
# Si ya los tenes, levanta en consola con:
#   ./levantar.sh
# ==========================

set -e

# Funciones auxiliares
check_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "Falta '$1'. Instalalo y volvé a probar."; exit 1; }
}

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    jobs -p | xargs -r kill
    echo "✅ Servidores detenidos"
    exit 0
}

# Capturar Ctrl+C para limpiar procesos
trap cleanup SIGINT SIGTERM

echo "Verificando Node.js y npm..."
check_cmd node
check_cmd npm

echo ""
echo "=========================="
echo " Instalando dependencias "
echo "=========================="

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json en backend/"
    exit 1
fi
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del backend"
    exit 1
fi
echo "✅ Dependencias del backend instaladas"

# Verificar si existe frontend y instalar sus dependencias
cd ../frontend
if [ -f "package.json" ]; then
    echo "📦 Instalando dependencias del frontend..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error instalando dependencias del frontend"
        exit 1
    fi
    echo "✅ Dependencias del frontend instaladas"
else
    echo "ℹ️  No se encontró package.json en frontend/, continuando..."
fi

cd ..

# Verificar archivo de configuración
echo ""
echo "=========================="
echo " Verificando configuración "
echo "=========================="
if [ ! -f ".env" ]; then
    echo "❌ Error: No se encontró el archivo 'env' en la raíz del proyecto"
    echo "   Crea el archivo env con las variables de configuración necesarias"
    exit 1
fi
echo "✅ Archivo de configuración encontrado"

echo ""
echo "=========================="
echo " Levantando servidores "
echo "=========================="
# Backend (puerto desde .env raíz; por defecto 4000)
(cd backend && npm start) &

# Frontend (archivos estáticos con live-server en 127.0.0.1:8080)
(cd frontend && npx live-server public --host=127.0.0.1 --port=8080 --no-browser) &

echo ""
echo "====================================="
echo " Ambos servidores corriendo en local "
echo " Backend: http://127.0.0.1:${PORT:-3000}"
echo " Frontend: http://127.0.0.1:8080 (por default live-server)"
echo " Presioná Ctrl+C para frenar todo."
echo "====================================="

# Espera indefinida para mantener el script vivo
wait
