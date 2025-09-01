# ==========================
# Script para levantar backend y frontend en local (modo dev)
# Ejecuten este comando antes para ver si tiene habilitados los permisos de ejecución:
#   chmod +x levantar.sh
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
npm install || true # Por si el front tiene dev server (vite, react, etc)
cd ..

echo ""
echo "=========================="
echo " Levantando servidores "
echo "=========================="
# Backend
(cd backend && npm run dev) &   # Ajustá a tu comando de desarrollo real, por ej npm start

# Frontend: 
# Si tu frontend es solo archivos estáticos (ej: vanilla JS), podés levantar con live-server:
# Si usás Vite/React/etc, reemplazá por npm run dev
(cd frontend && npx live-server public) &

echo ""
echo "====================================="
echo " Ambos servidores corriendo en local "
echo " Backend: http://localhost:3000"
echo " Frontend: http://127.0.0.1:8080 (por default live-server)"
echo " Presioná Ctrl+C para frenar todo."
echo "====================================="

# Espera indefinida para mantener el script vivo
wait
