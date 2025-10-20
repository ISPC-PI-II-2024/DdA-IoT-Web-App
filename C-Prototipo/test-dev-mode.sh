#!/bin/bash

# ==========================
# Script para probar el modo de desarrollo
# ==========================

echo "🔧 Probando modo de desarrollo..."

# Verificar que el servidor esté corriendo
if ! curl -s http://localhost:4000/api/auth/dev > /dev/null; then
    echo "❌ Error: El servidor no está corriendo en localhost:4000"
    echo "   Ejecuta: npm run dev"
    exit 1
fi

echo "✅ Servidor detectado"

# Probar login de desarrollo
echo "🔐 Probando login de desarrollo..."
RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/dev)

if echo "$RESPONSE" | grep -q "devMode"; then
    echo "✅ Login de desarrollo exitoso"
    echo "📧 Usuario: $(echo "$RESPONSE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)"
    echo "👤 Nombre: $(echo "$RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)"
    echo "🔑 Rol: $(echo "$RESPONSE" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)"
    
    # Extraer token
    TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$TOKEN" ]; then
        echo "🎫 Token obtenido: ${TOKEN:0:20}..."
        
        # Probar endpoint protegido
        echo "🔒 Probando endpoint protegido..."
        PROTECTED_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/config/general)
        
        if echo "$PROTECTED_RESPONSE" | grep -q "success"; then
            echo "✅ Acceso a endpoint protegido exitoso"
        else
            echo "❌ Error accediendo a endpoint protegido"
        fi
    fi
else
    echo "❌ Error en login de desarrollo"
    echo "Respuesta: $RESPONSE"
fi

echo ""
echo "🎯 Para usar el modo desarrollo:"
echo "   1. Asegúrate de que DEV_MODE=true en el archivo env"
echo "   2. Accede directamente a cualquier endpoint protegido"
echo "   3. O usa: curl -X POST http://localhost:4000/api/auth/dev"
