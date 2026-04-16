FROM node:19-alpine

WORKDIR /app

# Copy workspace root configuration
COPY package*.json ./

# Copy workspaces
COPY interfaces/ ./interfaces/
COPY front/ ./front/

# Install all workspace dependencies at root
RUN npm ci

# Build interfaces first
WORKDIR /app/interfaces
RUN npm run build

# Build frontend
WORKDIR /app/front
RUN npm run build

# Install serve globally
RUN npm install -g serve

EXPOSE 27021
