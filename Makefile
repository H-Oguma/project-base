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
	cd backend && uv run pytest

test-frontend:
	cd frontend && npm run test

lint: lint-backend lint-frontend

lint-backend:
	cd backend && uv run ruff check .

lint-frontend:
	cd frontend && npm run lint

up:
	npm run dev

down:
	@echo "ローカル直接実行環境（脱Docker）に移行したため、make down は不要です。起動中のターミナルで Ctrl+C を押して終了してください。"
