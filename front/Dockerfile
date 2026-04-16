FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY interfaces/package*.json ./interfaces/
COPY front/package*.json ./front/

RUN npm ci

COPY interfaces/ ./interfaces/
COPY front/ ./front/

WORKDIR /app/interfaces
RUN npm run build

WORKDIR /app/front
RUN npm run build

FROM node:22-alpine
RUN npm install -g serve
COPY --from=build /app/front/dist /app/dist
WORKDIR /app
EXPOSE 27021
