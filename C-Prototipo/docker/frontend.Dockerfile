# =========================
# Frontend Dockerfile
# =========================
FROM nginx:alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar configuración personalizada de Nginx
COPY ./nginx.conf /etc/nginx/nginx.conf

# Crear directorio para certificados
RUN mkdir -p /etc/nginx/certs

# Copiar archivos estáticos del frontend
COPY . /usr/share/nginx/html

# Crear archivo de health check
RUN echo '<!DOCTYPE html><html><body><h1>Frontend OK</h1></body></html>' > /usr/share/nginx/html/health

# Configurar permisos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Exponer puertos
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]