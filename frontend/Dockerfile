# 1. FAZA: Build aplikacije
FROM node:20-alpine AS build
WORKDIR /app

# Kopiranje datoteka za instalaciju zavisnosti
COPY package*.json ./
RUN npm install

# Kopiranje cijelog koda
COPY . .

# Primanje API URL-a kao argumenta i ugradnja u okolinu [cite: 3]
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Buildanje produkcijske verzije
RUN npm run build

# 2. FAZA: Posluživanje aplikacije putem Nginxa
FROM nginx:stable-alpine

# Kopiranje buildanih datoteka iz prve faze [cite: 2]
COPY --from=build /app/dist /usr/share/nginx/html

# Kopiranje tvoje prilagođene nginx.conf konfiguracije
# Ovo osigurava da /api zahtjevi idu prema backendu
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Izlaganje porta 80
EXPOSE 80

# Pokretanje Nginxa
CMD ["nginx", "-g", "daemon off;"]