# syntax=docker/dockerfile:1

# ---- base: shared dependency install, cached across dev/build ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- dev: vite dev server with hot reload ----
# Used when running `docker compose --profile dev up`.
# Source is bind-mounted over this in compose, so COPY here just makes the
# image runnable standalone (e.g. `docker run`) without a mount.
FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---- build: produces the static dist/ that S3 would actually serve ----
FROM base AS build
# Vite bakes VITE_* vars in at build time, so they must come in as build args,
# not runtime env vars, or they won't show up in the compiled JS.
ARG VITE_USE_MOCK=false
ARG VITE_API_URL
ARG VITE_COGNITO_ENDPOINT
ENV VITE_USE_MOCK=$VITE_USE_MOCK \
    VITE_API_URL=$VITE_API_URL \
    VITE_COGNITO_ENDPOINT=$VITE_COGNITO_ENDPOINT
COPY . .
RUN npm run build

# ---- prod: nginx serving the static build (mirrors what S3 + CloudFront do) ----
# Used when running `docker compose --profile prod up`.
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
