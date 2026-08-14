# syntax=docker/dockerfile:1

# --- Stage 1: install deps and build the static Vite bundle ---
FROM node:22-alpine AS build
WORKDIR /app

# Vite bakes VITE_* vars into the static bundle at build time, so it must
# be supplied here via --build-arg, not as a runtime container env var.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_APP_NAME
ENV VITE_APP_NAME=$VITE_APP_NAME

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: serve the built assets with nginx ---
FROM nginx:1.27-alpine AS frontend
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
