FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN ls -lR /app
COPY . .
RUN ls -lR /app
RUN npm run build && npm run postbuild
RUN ls -lR /app

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN ls -lR /app
EXPOSE 27020
CMD ["node", "/app/dist/src/server.js"]
