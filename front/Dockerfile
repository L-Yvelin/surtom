FROM node:19-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

FROM node:19-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
