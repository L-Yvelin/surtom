FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY interfaces/package*.json ./interfaces/
COPY surtom-design-system/package*.json ./surtom-design-system/
COPY front/package*.json ./front/

RUN npm ci

COPY surtom-design-system/scripts/ ./surtom-design-system/scripts/

WORKDIR /app/surtom-design-system
RUN npm run assets

WORKDIR /app
COPY interfaces/ ./interfaces/
COPY surtom-design-system/ ./surtom-design-system/
COPY front/ ./front/

WORKDIR /app/interfaces
RUN npm run build

WORKDIR /app/surtom-design-system
RUN npm run build

WORKDIR /app/front
RUN npm run build

FROM node:24-alpine
RUN npm install -g serve
COPY --from=build /app/front/dist /app/dist
WORKDIR /app
EXPOSE 27021
