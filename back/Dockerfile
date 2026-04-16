FROM node:19-alpine

WORKDIR /app

# Copy workspace root configuration
COPY package*.json ./

# Copy workspaces
COPY interfaces/ ./interfaces/
COPY back/ ./back/

# Install all workspace dependencies at root
RUN npm ci

# Build interfaces first
WORKDIR /app/interfaces
RUN npm run build

# Build backend
WORKDIR /app/back
RUN npm run build

EXPOSE 27020
