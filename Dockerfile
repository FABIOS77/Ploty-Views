# Multi-stage Dockerfile for Ploty-Views (Frontend)

# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine AS production
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
