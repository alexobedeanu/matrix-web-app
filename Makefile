# Makefile pentru management Docker și deployment

# Default environment
ENV ?= production

# Docker compose files
COMPOSE_FILE_PROD = docker-compose.yml
COMPOSE_FILE_DEV = docker-compose.dev.yml

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

.PHONY: help build up down logs clean test migrate seed health

# Default target
help:
	@echo "$(BLUE)Cyberpunk App Docker Management$(NC)"
	@echo ""
	@echo "$(YELLOW)Development Commands:$(NC)"
	@echo "  make dev-build    - Build development containers"
	@echo "  make dev-up       - Start development environment"
	@echo "  make dev-down     - Stop development environment"
	@echo "  make dev-logs     - View development logs"
	@echo ""
	@echo "$(YELLOW)Production Commands:$(NC)"
	@echo "  make prod-build   - Build production containers"
	@echo "  make prod-up      - Start production environment"
	@echo "  make prod-down    - Stop production environment"
	@echo "  make prod-logs    - View production logs"
	@echo ""
	@echo "$(YELLOW)Database Commands:$(NC)"
	@echo "  make migrate      - Run database migrations"
	@echo "  make seed         - Seed database with sample data"
	@echo "  make db-reset     - Reset database (destructive!)"
	@echo ""
	@echo "$(YELLOW)Utility Commands:$(NC)"
	@echo "  make health       - Check application health"
	@echo "  make clean        - Clean up Docker resources"
	@echo "  make test         - Run tests in Docker"

# Development commands
dev-build:
	@echo "$(BLUE)Building development containers...$(NC)"
	docker-compose -f $(COMPOSE_FILE_DEV) build

dev-up:
	@echo "$(BLUE)Starting development environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE_DEV) up -d
	@echo "$(GREEN)Development environment started at http://localhost:3000$(NC)"

dev-down:
	@echo "$(BLUE)Stopping development environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE_DEV) down

dev-logs:
	@echo "$(BLUE)Viewing development logs...$(NC)"
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f

# Production commands
prod-build:
	@echo "$(BLUE)Building production containers...$(NC)"
	docker-compose -f $(COMPOSE_FILE_PROD) build --no-cache

prod-up:
	@echo "$(BLUE)Starting production environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE_PROD) up -d
	@echo "$(GREEN)Production environment started at http://localhost:3000$(NC)"

prod-down:
	@echo "$(BLUE)Stopping production environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE_PROD) down

prod-logs:
	@echo "$(BLUE)Viewing production logs...$(NC)"
	docker-compose -f $(COMPOSE_FILE_PROD) logs -f

# Database commands
migrate:
	@echo "$(BLUE)Running database migrations...$(NC)"
	docker-compose -f $(COMPOSE_FILE_PROD) exec web-app npx prisma migrate deploy

seed:
	@echo "$(BLUE)Seeding database...$(NC)"
	docker-compose -f $(COMPOSE_FILE_PROD) exec web-app npm run seed

db-reset:
	@echo "$(RED)WARNING: This will destroy all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(BLUE)Resetting database...$(NC)"; \
		docker-compose -f $(COMPOSE_FILE_PROD) exec web-app npx prisma db push --force-reset; \
	fi

# Utility commands
health:
	@echo "$(BLUE)Checking application health...$(NC)"
	curl -f http://localhost:3000/api/health || echo "$(RED)Health check failed$(NC)"

clean:
	@echo "$(BLUE)Cleaning up Docker resources...$(NC)"
	docker system prune -f
	docker volume prune -f

test:
	@echo "$(BLUE)Running tests in Docker...$(NC)"
	docker-compose -f $(COMPOSE_FILE_DEV) exec web-app-dev npm test

# Quick deployment (build + up)
deploy-dev: dev-build dev-up
	@echo "$(GREEN)Development deployment complete!$(NC)"

deploy-prod: prod-build prod-up
	@echo "$(GREEN)Production deployment complete!$(NC)"

# Full reset and deploy
reset-deploy-prod: prod-down clean prod-build prod-up
	@echo "$(GREEN)Full production reset and deployment complete!$(NC)"