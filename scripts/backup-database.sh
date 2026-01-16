#!/bin/bash

# Database Backup Script
# Usage: ./scripts/backup-database.sh

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="wellness_db_${TIMESTAMP}.sql"
COMPOSE_FILE=${1:-docker-compose.yml}

echo -e "${BLUE}Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Backup database
echo -e "${BLUE}Creating backup: ${BACKUP_FILE}${NC}"
docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump \
    -U ${POSTGRES_USER:-wellness} \
    -d ${POSTGRES_DB:-wellness_db} \
    --clean --if-exists \
    > "${BACKUP_DIR}/${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    # Compress backup
    echo -e "${BLUE}Compressing backup...${NC}"
    gzip "${BACKUP_DIR}/${BACKUP_FILE}"
    
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}.gz" | cut -f1)
    echo -e "${GREEN}✓ Backup created successfully${NC}"
    echo -e "${GREEN}  File: ${BACKUP_DIR}/${BACKUP_FILE}.gz${NC}"
    echo -e "${GREEN}  Size: ${BACKUP_SIZE}${NC}"
    
    # Keep only last 7 backups
    echo -e "${BLUE}Cleaning old backups...${NC}"
    cd $BACKUP_DIR
    ls -t wellness_db_*.sql.gz | tail -n +8 | xargs -r rm
    cd ..
    
    echo -e "${GREEN}✓ Backup complete${NC}"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi
