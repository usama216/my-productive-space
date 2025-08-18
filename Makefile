# Makefile

# Load .env 
# This will read lines like APP_PORT=3000 & turn them into Make vars
-include docker/.env
export APP_PORT APP_HOST

#  CONFIG 
DOCKER_DIR   := docker
# ENV_FILE     := $(DOCKER_DIR)/.env
COMPOSE      := docker-compose -f $(DOCKER_DIR)/docker-compose.yml
IMAGE_DEV    := mps-frontend:dev
IMAGE_PROD   := mps-frontend:prod
# PORT         := $(shell grep -E '^APP_PORT=' $(ENV_FILE) | cut -d= -f2)

.PHONY: help build-dev run-dev build-prod run-prod compose-up compose-down logs

help:
	@echo "Usage:"
	@echo "  make build-dev    Build the dev image"
	@echo "  make run-dev      Run the dev container (hot-reload)"
	@echo "  make dev          build+run dev"
	@echo "  make build-prod   Build the prod image"
	@echo "  make run-prod     Run the prod container"
	@echo "  make prod         build+run prod"
	@echo "  make compose-up   docker-compose up --build -d"
	@echo "  make compose-down docker-compose down"
	@echo "  make logs         docker-compose logs -f"
# DEV image & container 
build-dev:
	docker build -f $(DOCKER_DIR)/Dockerfile -t $(IMAGE_DEV) .

run-dev:
	docker run --rm -it \
	  --name mps-frontend-dev \
	  -p $(APP_PORT):$(APP_PORT) \
	  -e HOST=$(APP_HOST) \
	  -e PORT=$(APP_PORT) \
	  -v $(CURDIR)/frontend:/frontend:rw \
	  -v node-modules:/frontend/node_modules \
	  $(IMAGE_DEV) 

# shortcut: build + run
dev: build-dev run-dev

#  PROD image & container
build-prod:
	docker build \
	  -f $(DOCKER_DIR)/Dockerfile.prod \
	  -t $(IMAGE_PROD) \
	  .

run-prod:
	docker run --rm -d \
	  --name mps-frontend-prod \
	  -p $(APP_PORT):$(APP_PORT) \
	  -e PORT=$(APP_PORT) \
	  $(IMAGE_PROD)

prod: build-prod run-prod

#  Docker-compose shortcuts 
compose-up:
	$(COMPOSE) up --build -d

compose-down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f
