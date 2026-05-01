#!/bin/bash
npx prettier --write . && npm run build --workspace=interfaces && docker compose up --build -d backend & npm run build:front
