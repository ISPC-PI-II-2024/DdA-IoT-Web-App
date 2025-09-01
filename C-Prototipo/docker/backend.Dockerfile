# Usa una imagen oficial de Node.js (alpine = ligera)
FROM node:20-alpine

# Crea y setea el directorio de trabajo
WORKDIR /app

# Copia solo los archivos de dependencias primero, para cachear mejor las builds
COPY package*.json ./
RUN npm install --omit=dev

# Copia el resto del código fuente
COPY . .

# Define el entorno de producción
ENV NODE_ENV=production

# Expone el puerto seguro por defecto (ajusta si tu app escucha en otro)
EXPOSE 4443

# Comando de inicio (ajusta si usas otro script)
CMD ["npm", "start"]

# NOTA: Si tu backend aún no soporta HTTPS directo, avísame para adaptarlo.
