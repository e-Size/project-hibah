#!/bin/bash
set -e

echo "🚀 Starting deployment..."

cd /root/project-hibah

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Build & restart containers
echo "🔨 Building & restarting containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Cleanup old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deploy complete!"
echo "📊 Container status:"
docker compose -f docker-compose.prod.yml ps
