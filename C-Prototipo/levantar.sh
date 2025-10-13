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

echo "Verificando Node.js y npm..."
check_cmd node
check_cmd npm

echo ""
echo "=========================="
echo " Instalando dependencias "
echo "=========================="
cd backend
npm install
cd ../frontend
cd ..

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
echo " Backend: http://127.0.0.1:${PORT:-4000}"
echo " Frontend: http://127.0.0.1:8080 (por default live-server)"
echo " Presioná Ctrl+C para frenar todo."
echo "====================================="

# Espera indefinida para mantener el script vivo
wait
