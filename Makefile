.PHONY: help setup test-all test-backend test-frontend lint lint-backend lint-frontend up down

help:
	@echo "利用可能なコマンド:"
	@echo "  make setup         - 新規プロジェクトのセットアップを開始"
	@echo "  make test-all      - バックエンドとフロントエンドのテストを実行"
	@echo "  make lint          - バックエンドとフロントエンドのLintを実行"
	@echo "  make up            - Dockerコンテナをバックグラウンドで起動"
	@echo "  make down          - Dockerコンテナを停止・削除"

setup:
	@./scripts/init.sh

test-all: test-backend test-frontend

test-backend:
	cd backend && pytest

test-frontend:
	cd frontend && npm run test

lint: lint-backend lint-frontend

lint-backend:
	cd backend && ruff check .

lint-frontend:
	cd frontend && npm run lint

up:
	docker compose up -d

down:
	docker compose down
