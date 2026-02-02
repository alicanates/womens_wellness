#!/bin/bash

# Deploy to Production Server
# Server: 31.97.34.163
# Domain: kadinatlasi.com

set -e

SERVER="31.97.34.163"
USER="root"
APP_DIR="/root/womens_wellness"

echo "🚀 Deploying to production server..."
echo "Server: $SERVER"
echo "Domain: kadinatlasi.com"
echo ""

# SSH into server and pull latest changes
ssh $USER@$SERVER << 'ENDSSH'
cd /root/womens_wellness

echo "📥 Pulling latest changes from GitHub..."
git pull origin chatbot

echo "📦 Installing dependencies..."
cd apps/api
pnpm install
cd ../admin
pnpm install
cd ../..

echo "🔨 Building applications..."
cd apps/api
pnpm build
cd ../admin
pnpm build
cd ../..

echo "🔄 Restarting services with Docker Compose..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

echo "⏳ Waiting for services to start..."
sleep 10

echo "✅ Checking service health..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 Deployment completed!"
echo "API: https://kadinatlasi.com"
echo "Admin: https://admin.kadinatlasi.com"
ENDSSH

echo ""
echo "✅ Deployment successful!"
