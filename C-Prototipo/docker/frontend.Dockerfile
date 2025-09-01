# Usa la imagen oficial de Nginx
FROM nginx:alpine

# Copia la configuración personalizada de Nginx (para HTTPS y rutas)
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copia todos los archivos estáticos del frontend
COPY . /usr/share/nginx/html

# Expone el puerto HTTPS por defecto
EXPOSE 443

# NOTA: A futuro, puedes redirigir HTTP a HTTPS si lo deseas.
