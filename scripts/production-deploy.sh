#!/bin/bash

# Production Deployment Script
# Usage: ./scripts/production-deploy.sh [version]

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

VERSION=${1:-latest}
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Production Deployment - v${VERSION}${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}✗ .env.production file not found${NC}"
    echo "Please create .env.production with production configuration"
    exit 1
fi

# Load production environment
export $(cat .env.production | grep -v '^#' | xargs)

echo -e "${BLUE}1. Pulling latest images...${NC}"
docker-compose -f $COMPOSE_FILE pull

echo -e "${BLUE}2. Stopping old containers...${NC}"
docker-compose -f $COMPOSE_FILE down

echo -e "${BLUE}3. Starting new containers...${NC}"
docker-compose -f $COMPOSE_FILE up -d

echo -e "${BLUE}4. Waiting for services to be ready...${NC}"
sleep 15

echo -e "${BLUE}5. Running database migrations...${NC}"
docker-compose -f $COMPOSE_FILE exec -T api pnpm prisma migrate deploy

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Migration failed${NC}"
    echo -e "${YELLOW}Rolling back...${NC}"
    docker-compose -f $COMPOSE_FILE down
    exit 1
fi

echo -e "${BLUE}6. Health check...${NC}"
sleep 10

# Check API health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API is healthy${NC}"
else
    echo -e "${RED}✗ API health check failed${NC}"
    docker-compose -f $COMPOSE_FILE logs api
    exit 1
fi

# Check Admin health
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Admin is healthy${NC}"
else
    echo -e "${RED}✗ Admin health check failed${NC}"
    docker-compose -f $COMPOSE_FILE logs admin
    exit 1
fi

echo -e "${BLUE}7. Cleaning up old images...${NC}"
docker image prune -af --filter "until=24h"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Successful! 🚀            ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}Deployed version:${NC} ${VERSION}"
echo -e "${BLUE}Services:${NC}"
docker-compose -f $COMPOSE_FILE ps
echo ""
echo -e "${YELLOW}Monitor logs with:${NC} docker-compose -f $COMPOSE_FILE logs -f"
