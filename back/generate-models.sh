#!/bin/sh
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

rm -rf ./src/dbModels/*

npx sequelize-auto \
  -o "./src/dbModels" \
  -d "$MYSQL_DATABASE" \
  -h "${DB_HOST:-localhost}" \
  -u "$DB_USER" \
  -p "${DB_PORT:-3306}" \
  -x "$MYSQL_ROOT_PASSWORD" \
  -e mysql \
  -l ts
