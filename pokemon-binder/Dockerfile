# ── Stage 1: build the React app ──────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# In production the React app calls /api/... (relative), so no REACT_APP_API_URL needed.
# Pass a build arg only if you need to point to an external backend host.
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# ── Stage 2: serve with Nginx ──────────────────────────────────────────────────
FROM nginx:1.25-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
