# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Instalar dependencias primero para aprovechar el cache de Docker
COPY package*.json ./
RUN npm install

# Copiar el resto del código y construir la app
COPY . .
RUN npm run build

# Stage de producción (Servidor web)
FROM nginx:stable-alpine

# Configuración personalizada de Nginx para manejar Single Page Application (React Router)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
