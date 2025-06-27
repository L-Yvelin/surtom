#!/bin/bash

# Database Migration Script for Surtom
# This script exports from localhost MySQL, imports to Docker MySQL, runs migration, and cleans up

set -e

# Source database connection (your localhost MySQL)
SOURCE_DB_HOST="127.0.0.1"
SOURCE_DB_PORT="3306"
SOURCE_DB_USER="surtom_user"
SOURCE_DB_PASSWORD="LeSiteDeLEteQuiGarantiUnSuccesPourToutUtilisateurVisAVisDeSaCarriereProfesionnelle!"
SOURCE_DB_NAME="surtom"

# Target database connection (Docker MySQL)
TARGET_CONTAINER="surtom-mysql-1"
TARGET_DB_NAME="surtom"
TARGET_DB_USER="root"
TARGET_DB_PASSWORD="password"

# Migration file
MIGRATION_FILE="migrate.sql"

echo "🚀 Starting Surtom Database Migration..."
echo "🔑 Using password: $TARGET_DB_PASSWORD"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file $MIGRATION_FILE not found! Please place it in the project root."
    exit 1
fi

echo "🔄 Resetting Docker MySQL container..."
# Stop and remove existing container
docker compose down mysql 2>/dev/null || true
docker rm -f $TARGET_CONTAINER 2>/dev/null || true

echo "🗑️ Removing existing MySQL volume..."
docker volume rm surtom_mysql_data 2>/dev/null || true

echo "📊 Exporting schema from localhost MySQL..."
# Export schema only
mysqldump -h "$SOURCE_DB_HOST" -P "$SOURCE_DB_PORT" -u "$SOURCE_DB_USER" -p"$SOURCE_DB_PASSWORD" \
    --no-data --routines --triggers "$SOURCE_DB_NAME" > temp_schema.sql

# Fix invalid DEFAULT curdate() in temp_schema.sql
sed -i 's/DEFAULT curdate()//g' temp_schema.sql
# Fix invalid DEFAULT current_timestamp() in temp_schema.sql for DATE columns
sed -i 's/DEFAULT current_timestamp()//g' temp_schema.sql

echo "📊 Exporting data from localhost MySQL..."
# Export data only
mysqldump -h "$SOURCE_DB_HOST" -P "$SOURCE_DB_PORT" -u "$SOURCE_DB_USER" -p"$SOURCE_DB_PASSWORD" \
    --no-create-info --skip-triggers --routines=false "$SOURCE_DB_NAME" > temp_data.sql

echo "✅ Export completed: temp_schema.sql and temp_data.sql"

echo "🐳 Starting fresh MySQL Docker container..."
docker compose up -d mysql

echo "⏳ Waiting for MySQL container to be ready..."
sleep 20

# Wait for MySQL to be ready with more robust checking
echo "🔍 Checking MySQL readiness..."
until docker exec $TARGET_CONTAINER mysqladmin ping -h localhost --silent; do
    echo "Waiting for MySQL to be ready..."
    sleep 5
done

# Test connection before proceeding
echo "🔍 Testing MySQL connection..."
until docker exec $TARGET_CONTAINER mysql -u $TARGET_DB_USER -p$TARGET_DB_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; do
    echo "Testing MySQL connection..."
    sleep 2
done

echo "✅ MySQL connection confirmed!"

echo "📥 Importing schema into Docker MySQL..."
docker exec -i $TARGET_CONTAINER mysql -h localhost -u $TARGET_DB_USER -p$TARGET_DB_PASSWORD $TARGET_DB_NAME < temp_schema.sql

echo "📥 Importing data into Docker MySQL..."
docker exec -i $TARGET_CONTAINER mysql -h localhost -u $TARGET_DB_USER -p$TARGET_DB_PASSWORD $TARGET_DB_NAME < temp_data.sql

echo "🔄 Running migration script to transform data..."
# Prepend SET SESSION group_concat_max_len to migrate.sql to avoid GROUP_CONCAT truncation
sed -i '1iSET SESSION group_concat_max_len = 1000000;' migrate.sql
docker exec -i $TARGET_CONTAINER mysql -h localhost -u $TARGET_DB_USER -p$TARGET_DB_PASSWORD $TARGET_DB_NAME < migrate.sql

echo "🧹 Cleaning up obsolete tables..."
docker exec $TARGET_CONTAINER mysql -h localhost -u $TARGET_DB_USER -p$TARGET_DB_PASSWORD $TARGET_DB_NAME -e "DROP TABLE IF EXISTS ScoreData, Score , Surtomien, Messages, MessageImages;"

echo "✅ Migration completed successfully!"
echo "🎉 Your data has been migrated to the Docker MySQL container with the new schema."

echo "\n🔍 Verifying migrated data..."
# Show tables
docker exec $TARGET_CONTAINER mysql -h localhost -u $TARGET_DB_USER -p$TARGET_DB_PASSWORD $TARGET_DB_NAME -e "SHOW TABLES;"
# Show player count
docker exec $TARGET_CONTAINER mysql -h localhost -u $TARGET_DB_USER -p$TARGET_DB_PASSWORD $TARGET_DB_NAME -e "SELECT COUNT(*) as player_count FROM Player;"
# Show message count
docker exec $TARGET_CONTAINER mysql -h localhost -u $TARGET_DB_USER -p$TARGET_DB_PASSWORD $TARGET_DB_NAME -e "SELECT COUNT(*) as message_count FROM Message;"
# Show last 5 messages
docker exec $TARGET_CONTAINER mysql -h localhost -u $TARGET_DB_USER -p$TARGET_DB_PASSWORD $TARGET_DB_NAME -e "SELECT m.ID, p.Username, m.Type, m.Timestamp FROM Message m JOIN Player p ON m.PlayerID = p.ID ORDER BY m.Timestamp DESC LIMIT 5;"

echo "\n✅ Migration and verification complete!" 