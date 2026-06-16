FROM node:20-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/src ./src
COPY backend/database ./database
COPY backend/middleware ./middleware
COPY backend/services ./services
COPY backend/controllers ./controllers
COPY backend/routes ./routes
COPY backend/utils ./utils
COPY backend/config ./config
RUN mkdir -p uploads/documents uploads/invoices uploads/colleges uploads/resources
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:5000/health || exit 1
CMD ["node", "src/server.js"]

FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine AS frontend
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
