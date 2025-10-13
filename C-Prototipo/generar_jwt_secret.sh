# ==========================
# Script para generar secretos de JWT

# ==========================

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"