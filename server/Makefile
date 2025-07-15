DOCKER_COMPOSE = docker-compose
SH_NODE = $(DOCKER_COMPOSE) exec -it node /bin/bash
EXEC_NODE = $(DOCKER_COMPOSE) exec node
COMPOSE_FILE = docker-compose.yml

# include .env.local
# export $(shell sed 's/=.*//' .env.local)

# CURRENT_BRANCH := $(shell git branch --show-current)
# CURRENT_PROJECT_DIR = $(CURDIR)/app

help:
	@echo "Available commands:"
	@echo "  up                Start the Docker containers"
	@echo "  down              Stop the Docker containers"
	@echo "  sh-node           Open an interactive shell in the Node.js container"
	@echo "  sh-react          Open an interactive shell in the React container"
	@echo "  restart           Restart the Docker containers"
	@echo "  logs              View the logs of the Docker containers"
	@echo "  npm-install       Install Node.js dependencies in the Node.js container"
	@echo "  npm-update        Update Node.js dependencies in the Node.js container"
	@echo "  build-react       Build the React app"
	@echo "  php               Display PHP version (if PHP container is used)"
	@echo "  help              Show this help message"

start: ## Start containers
	$(DOCKER_COMPOSE) up -d

stop: ## Stop containers
	$(DOCKER_COMPOSE) stop

restart: ## Restart containers
	make stop
	make start

remove: ## Remove containers
	$(DOCKER_COMPOSE) down

build: ## Build docker images
	$(DOCKER_COMPOSE) build --no-cache

rebuild: ## Rebuild docker images and recreate docker containers
	make remove
	make build
	make start

logs: ## Get the logs of the container
	$(DOCKER_COMPOSE) logs -f $(c)

sh-node: ## Open an interactive shell in the Node.js container
	$(SH_NODE)

sh-react: ## Open an interactive shell in the React container
	$(SH_REACT)

npm-install: ## Install Node.js dependencies in the Node.js container
	$(EXEC_NODE) npm install

npm-update: ## Update Node.js dependencies in the Node.js container
	$(EXEC_NODE) npm update

build-react: ## Build the React app in the React container
	$(EXEC_REACT) npm run build