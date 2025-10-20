# 🔧 Modo de Desarrollo Local

Este documento explica cómo usar el modo de desarrollo local que permite saltarse la autenticación de Google y acceder a todas las funcionalidades como administrador.

## ⚙️ Configuración

El modo desarrollo se activa mediante las siguientes variables en el archivo `env`:

```bash
DEV_MODE=true
DEV_USER_EMAIL=dev@localhost.com
DEV_USER_NAME=Desarrollador Local
```

## 🚀 Cómo Usar

### Opción 1: Acceso Automático (Recomendado)

Cuando `DEV_MODE=true`, el middleware de autenticación automáticamente:
- ✅ Permite acceso a todas las rutas protegidas sin token
- ✅ Asigna rol de `admin` automáticamente
- ✅ Usa las credenciales configuradas en `DEV_USER_EMAIL` y `DEV_USER_NAME`

**No necesitas hacer login, simplemente accede a cualquier endpoint protegido.**

### Opción 2: Login Explícito

Si prefieres hacer login explícito, puedes usar el endpoint de desarrollo:

```bash
POST http://localhost:4000/api/auth/dev
```

**Respuesta:**
```json
{
  "user": {
    "email": "dev@localhost.com",
    "name": "Desarrollador Local"
  },
  "role": "admin",
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": "15m",
  "devMode": true,
  "message": "Login de desarrollo exitoso"
}
```

## 🔒 Seguridad

- ⚠️ **IMPORTANTE**: El modo desarrollo solo funciona cuando `DEV_MODE=true`
- ⚠️ En producción (`DEV_MODE=false`), el endpoint `/dev` retorna 404
- ⚠️ El middleware solo permite acceso sin token en modo desarrollo

## 📊 Usuario de Desarrollo

El sistema automáticamente:
1. Crea el usuario `dev@localhost.com` en la base de datos si no existe
2. Le asigna permisos de `admin=TRUE` y `action=TRUE`
3. Actualiza el último login en cada acceso

## 🎯 Casos de Uso

- **Desarrollo Frontend**: Acceso inmediato sin configuración de Google OAuth
- **Testing**: Pruebas rápidas de funcionalidades administrativas
- **Debugging**: Acceso completo para resolver problemas
- **Demostraciones**: Presentaciones sin dependencias externas

## 🔄 Cambiar a Producción

Para desactivar el modo desarrollo:

```bash
# En el archivo env
DEV_MODE=false
```

Esto activará la autenticación normal con Google OAuth.

---

**💡 Tip**: El modo desarrollo es perfecto para desarrollo local, pero recuerda desactivarlo antes de desplegar a producción.
