#!/bin/bash

# Setup and Deploy to Production Server
# Server: 31.97.34.163
# Domain: kadinatlasi.com

set -e

SERVER="31.97.34.163"
USER="root"
APP_DIR="/root/womens_wellness"

echo "🚀 Setting up and deploying to production server..."
echo "Server: $SERVER"
echo "Domain: kadinatlasi.com"
echo ""

# SSH into server and setup + deploy
ssh $USER@$SERVER << 'ENDSSH'
cd /root/womens_wellness

echo "📥 Pulling latest changes from GitHub..."
git pull origin chatbot

echo "🔧 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "✅ Docker and Docker Compose are ready"

echo "🔄 Building and starting services with Docker Compose..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to start..."
sleep 15

echo "✅ Checking service health..."
docker-compose -f docker-compose.prod.yml ps

echo "📊 Checking logs..."
docker-compose -f docker-compose.prod.yml logs --tail=20

echo ""
echo "🎉 Deployment completed!"
echo "API: https://kadinatlasi.com"
echo "Admin: https://admin.kadinatlasi.com"
ENDSSH

echo ""
echo "✅ Deployment successful!"
