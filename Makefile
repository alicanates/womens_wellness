.PHONY: help dev up down build clean logs restart db-migrate db-seed test lint

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Wellness App - Docker Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Development Commands
dev: ## Start development environment
	@echo "$(BLUE)Starting development environment...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started!$(NC)"
	@echo "API: http://localhost:3000"
	@echo "Admin: http://localhost:3001"
	@echo "Astrology: http://localhost:5000"

up: dev ## Alias for dev

down: ## Stop all services
	@echo "$(YELLOW)Stopping services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

build: ## Build all Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)✓ Build complete$(NC)"

rebuild: ## Rebuild all images from scratch
	@echo "$(BLUE)Rebuilding Docker images...$(NC)"
	docker-compose build --no-cache
	@echo "$(GREEN)✓ Rebuild complete$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

clean: ## Remove all containers, volumes, and images
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker-compose down -v --rmi all
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

logs: ## Show logs from all services
	docker-compose logs -f

logs-api: ## Show API logs
	docker-compose logs -f api

logs-admin: ## Show Admin logs
	docker-compose logs -f admin

logs-astrology: ## Show Astrology service logs
	docker-compose logs -f astrology

# Database Commands
db-migrate: ## Run database migrations
	@echo "$(BLUE)Running migrations...$(NC)"
	docker-compose exec api pnpm prisma migrate deploy
	@echo "$(GREEN)✓ Migrations complete$(NC)"

db-seed: ## Seed database
	@echo "$(BLUE)Seeding database...$(NC)"
	docker-compose exec api pnpm prisma db seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

db-studio: ## Open Prisma Studio
	@echo "$(BLUE)Opening Prisma Studio...$(NC)"
	docker-compose exec api pnpm prisma studio

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "$(YELLOW)⚠️  This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose exec api pnpm prisma migrate reset --force; \
		echo "$(GREEN)✓ Database reset$(NC)"; \
	fi

# Testing Commands
test: ## Run all tests
	@echo "$(BLUE)Running tests...$(NC)"
	docker-compose exec api pnpm test

test-api: ## Run API tests
	docker-compose exec api pnpm test

test-e2e: ## Run E2E tests
	docker-compose exec api pnpm test:e2e

# Code Quality
lint: ## Run linting
	@echo "$(BLUE)Running linters...$(NC)"
	pnpm lint

format: ## Format code
	@echo "$(BLUE)Formatting code...$(NC)"
	pnpm prettier --write .

# Production Commands
prod-up: ## Start production environment
	@echo "$(BLUE)Starting production environment...$(NC)"
	docker-compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Production services started$(NC)"

prod-down: ## Stop production environment
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## Show production logs
	docker-compose -f docker-compose.prod.yml logs -f

# Utility Commands
shell-api: ## Open shell in API container
	docker-compose exec api sh

shell-admin: ## Open shell in Admin container
	docker-compose exec admin sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U wellness -d wellness_db

shell-redis: ## Open Redis CLI
	docker-compose exec redis redis-cli

ps: ## Show running containers
	docker-compose ps

stats: ## Show container resource usage
	docker stats

health: ## Check service health
	@echo "$(BLUE)Checking service health...$(NC)"
	@curl -f http://localhost:3000/health && echo "$(GREEN)✓ API healthy$(NC)" || echo "$(YELLOW)✗ API unhealthy$(NC)"
	@curl -f http://localhost:3001 && echo "$(GREEN)✓ Admin healthy$(NC)" || echo "$(YELLOW)✗ Admin unhealthy$(NC)"
	@curl -f http://localhost:5000 && echo "$(GREEN)✓ Astrology healthy$(NC)" || echo "$(YELLOW)✗ Astrology unhealthy$(NC)"

# Environment Setup Commands
setup-env: ## Interactive production environment setup
	@echo "$(BLUE)Starting environment setup wizard...$(NC)"
	./scripts/setup-production-env.sh

validate-env: ## Validate production environment variables
	@echo "$(BLUE)Validating environment...$(NC)"
	./scripts/validate-production-env.sh

check-deployment: ## Run deployment checklist
	@echo "$(BLUE)Deployment Checklist:$(NC)"
	@echo "See DEPLOYMENT_CHECKLIST.md for complete checklist"
	@echo ""
	@echo "Quick checks:"
	@./scripts/validate-production-env.sh || true

# Backup Commands
backup-db: ## Backup database
	@echo "$(BLUE)Creating database backup...$(NC)"
	@mkdir -p backups
	docker-compose exec -T postgres pg_dump -U wellness wellness_db > backups/db_backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup created in backups/$(NC)"

restore-db: ## Restore database from backup (usage: make restore-db FILE=backups/db_backup_xxx.sql)
	@echo "$(YELLOW)⚠️  This will overwrite current database!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $REPLY =~ ^[Yy]$ ]]; then \
		docker-compose exec -T postgres psql -U wellness wellness_db < $(FILE); \
		echo "$(GREEN)✓ Database restored$(NC)"; \
	fi
