# SURTOM

A Minecraft Wordle.

React front and Node back, connected via WebSocket.

## Monorepo Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    SURTOM Monorepo (npm Workspaces)                          │
│                                                                              │
│   ┌─────────────────────┐          ┌──────────────────────┐                  │
│   │       front         │          │     interfaces       │                  │
│   │                     │◄────────►│                      │                  │
│   │  React + Vite       │          │  Shared TypeScript   │                  │
│   │  + TypeScript       │          │  Package             │                  │
│   │                     │          │  • Message.ts        │                  │
│   │  Frontend UI        │          │  • validator.ts      │                  │
│   │  & WebSocket Client │          │  • index.ts          │                  │
│   └─────────────────────┘          └──────────────────────┘                  │
│            ▲                           ▲          ▲                          │
│            │                           │          │                          │
│            └──────────────┬────────────┘          │                          │
│                           │                       │                          │
│                 Real-time WebSocket               │                          │
│                 (ws://localhost:27020)            │                          │
│                           │                       │                          │
│                           ▼                       │                          │
│   ┌─────────────────────┐                         │                          │
│   │        back         │                         │                          │
│   │                     │                         │                          │
│   │  Node.js + WebSocket│                         │                          │
│   │  Server + TypeScript│                         │                          │
│   │                     │                         │                          │
│   │  Game logic         │                         │                          │
│   │  WS handling        │─────────────────────────┘                          │
│   │  MySQL integration  │                                                    │
│   └─────────────────────┘                                                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js
- Docker and Docker Compose

## First startup

### 1. Environment files

```
cp back/.env.example back/.env
cp front/.env.example front/.env
```

Fill in `back/.env` with your database password (`DB_PASSWORD` and `MYSQL_ROOT_PASSWORD`).

For local development, update `front/.env`:

```
VITE_WEBSOCKET_PROTOCOL=ws
VITE_WEBSOCKET_HOST=localhost
VITE_WEBSOCKET_PORT=27020
VITE_WEBSOCKET_PATH=
```

### 2. Start MySQL

```
docker compose up -d mysql
```

On first run, the schema and seed data are loaded automatically from `back/01-schema.sql` and `back/02-seed.sql`.

### 3. Install dependencies

```
npm install
```

### 4. Build the shared interfaces package

```
npm run build --workspace=interfaces
```

### 5. Run

```
npm run dev
```

This starts both the backend (port 27020) and the frontend (Vite dev server).

## Other services

- phpMyAdmin: `docker compose up -d phpmyadmin`, then http://localhost:27023
