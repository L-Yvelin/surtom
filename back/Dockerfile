FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
COPY interfaces/package*.json ./interfaces/
COPY back/package*.json ./back/

RUN npm ci --omit=dev

COPY interfaces/ ./interfaces/
COPY back/ ./back/

WORKDIR /app/interfaces
RUN npm run build

WORKDIR /app/back
RUN npm run build

EXPOSE 27020
