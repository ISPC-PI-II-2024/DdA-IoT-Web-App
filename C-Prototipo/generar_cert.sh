# ==========================
# Script para generar certificados temporales autofirmados para pruebas locales.
# Usar Let's Encrypt o certificados reales en producción!
# ==========================

mkdir -p certs

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/privkey.pem -out certs/fullchain.pem \
  -subj "/CN=iot-opalo.work"

echo "Certificados generados en ./certs/"

# Uso del elemento
#    chmod +x generar_certs.sh
#    ./generar_certs.sh
