FROM node:19-alpine AS builder

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build
