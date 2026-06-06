#!/bin/bash
set -e

echo "🚀 Starting deployment..."

cd /root/project-hibah

echo "📥 Pulling latest code..."
git pull origin main

echo "🔨 Building & restarting containers..."
docker compose -f docker-compose.be.yml --env-file .env.production up -d --build
docker compose -f docker-compose.fe.yml --env-file .env.production build --no-cache
docker compose -f docker-compose.fe.yml --env-file .env.production up -d

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "📊 Container status:"
docker compose -f docker-compose.be.yml ps
docker compose -f docker-compose.fe.yml ps

echo "✅ Deploy complete!"