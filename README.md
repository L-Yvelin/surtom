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
│   │  MySQL + Drizzle    │                                                    │
│   └─────────────────────┘                                                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 22+
- Docker and Docker Compose

## First-time setup (fresh clone)

### 1. Environment files

```bash
cp back/.env.example back/.env
cp front/.env.example front/.env
```

Edit `back/.env` and set:

- `DB_PASSWORD` and `MYSQL_ROOT_PASSWORD` to the **same** value (anything you like for local dev).
- Optionally `NTFY_URL` if you use ntfy notifications.

For local development, `front/.env` should be:

```
VITE_WEBSOCKET_PROTOCOL=ws
VITE_WEBSOCKET_HOST=localhost
VITE_WEBSOCKET_PORT=27020
VITE_WEBSOCKET_PATH=
```

### 2. Install dependencies

```bash
npm install
npm run build --workspace=interfaces
```

### 3. Start MySQL

```bash
docker compose up -d mysql
```

The container will create an empty `surtom` database (no schema yet).

### 4. Run migrations and seed

```bash
cd back
npm run db:setup      # = db:migrate + db:seed
```

That creates all tables (via Drizzle migrations in `back/src/db/migrations/`) and inserts the default Worlds (`fr`, `en`) plus the system / funny-name `Player` rows.

### 5. (Optional) Seed word lists

The base seed does **not** populate the dictionary, MinecraftSolution, or MinecraftWord tables. To seed words for a language, use:

```bash
cd back
npm run db:seed:words -- \
  --lang fr \
  --lang-file data/minecraft-lang/fr_fr.json \
  --dict data/dictionary/fr.txt \
  --apply
```

(Repeat with `--lang en`, the corresponding `en_us.json`, and `data/dictionary/en.txt`.)

Without `--apply`, the script runs in dry-run mode and writes the candidate word lists to `back/data/seed-output/<lang>/`.

### 6. Run dev servers

```bash
# from the repo root
npm run dev
```

Backend on port 27020, frontend on the Vite dev server.

---

## Database workflow

The DB layer uses [Drizzle ORM](https://orm.drizzle.team/) with MySQL. The single source of truth for the schema is `back/src/db/schema.ts`.

| Command (run inside `back/`)   | What it does                                                                                                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run db:generate`          | Diffs `schema.ts` against the last applied migration and emits a new SQL migration into `src/db/migrations/`.                                                                |
| `npm run db:migrate`           | Applies any pending migrations (tracks state in the `__drizzle_migrations` table).                                                                                           |
| `npm run db:seed`              | Idempotently inserts default Worlds + system Players.                                                                                                                        |
| `npm run db:seed:words -- ...` | Bulk-inserts dictionary / MinecraftSolution / MinecraftWord rows for a language.                                                                                             |
| `npm run db:setup`             | Convenience: `db:migrate` then `db:seed`.                                                                                                                                    |
| `npm run db:baseline`          | One-off: marks all existing migrations as already applied (for an existing DB that already has the schema, e.g. after pulling this branch on top of a hand-bootstrapped DB). |
| `npm run db:studio`            | Opens Drizzle Studio (a web UI to browse rows) at `https://local.drizzle.studio`.                                                                                            |

### Adding a new column / table

1. Edit `back/src/db/schema.ts`.
2. Run `npm run db:generate` (give it a meaningful name with `--name add_xyz`).
3. Inspect the generated SQL in `src/db/migrations/`.
4. Run `npm run db:migrate`.
5. Commit the schema change AND the generated migration files together.

### Migrating an existing DB (was bootstrapped before Drizzle)

If you have an old `surtom` database that was set up via the old `01-schema.sql` / `02-seed.sql` flow and you do **not** want to wipe it:

```bash
cd back
npm run db:baseline      # tells Drizzle: "this DB already matches 0000_init"
npm run db:seed          # idempotent, safe to re-run
```

If you don't care about the existing data, the simpler path is:

```bash
docker compose down -v   # wipes the mysql_data volume
docker compose up -d mysql
cd back && npm run db:setup
```

---

## Other services

- phpMyAdmin: `docker compose up -d phpmyadmin`, then http://localhost:27023
- Drizzle Studio: `cd back && npm run db:studio`
