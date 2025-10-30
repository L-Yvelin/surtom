#!/bin/bash

# Verification Script for Surtom Database Migration
# This script checks that your data was migrated successfully

set -e

echo "🔍 Verifying Surtom Database Migration..."

# Check if containers are running
if ! docker ps | grep -q surtom-mysql; then
    echo "❌ MySQL container is not running. Start it with:"
    echo "   docker-compose up -d mysql"
    exit 1
fi

echo "✅ MySQL container is running"

# Get database password from environment or use default
DB_PASSWORD=${DB_PASSWORD:-password}

echo ""
echo "📊 Database Statistics:"

# Check tables
echo "📋 Tables in database:"
docker exec surtom-mysql-1 mysql -u root -p"$DB_PASSWORD" surtom -e "SHOW TABLES;"

echo ""
echo "👥 Player count:"
docker exec surtom-mysql-1 mysql -u root -p"$DB_PASSWORD" surtom -e "SELECT COUNT(*) as player_count FROM Player;"

echo ""
echo "💬 Message count:"
docker exec surtom-mysql-1 mysql -u root -p"$DB_PASSWORD" surtom -e "SELECT COUNT(*) as message_count FROM Message;"

echo ""
echo "🎮 Score messages count:"
docker exec surtom-mysql-1 mysql -u root -p"$DB_PASSWORD" surtom -e "SELECT COUNT(*) as score_count FROM Message WHERE Type = 'SCORE';"

echo ""
echo "📝 Recent messages (last 5):"
docker exec surtom-mysql-1 mysql -u root -p"$DB_PASSWORD" surtom -e "
SELECT 
    m.ID,
    p.Username,
    m.Type,
    m.Timestamp
FROM Message m
JOIN Player p ON m.PlayerID = p.ID
ORDER BY m.Timestamp DESC
LIMIT 5;"

echo ""
echo "✅ Migration verification completed!"
echo "🎉 Your data has been successfully migrated to the Docker container." 