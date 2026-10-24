.PHONY: check check-backend check-frontend setup-hooks dev dev-backend dev-frontend

# Git Hooks の自動登録と実行権限付与
setup-hooks:
	@git config core.hooksPath .githooks 2>/dev/null || true
	@chmod +x .githooks/* 2>/dev/null || true

# AI・開発者共通のワンコマンド全方位検証ゲート
check: setup-hooks check-backend check-frontend
	@echo "✅ All AI-Native quality gates (Ruff, Pytest, Oxlint, Vitest, Build) passed!"

# バックエンドの静的解析・フォーマット検査・単体/統合テスト
check-backend:
	cd backend && uv run ruff check .
	cd backend && uv run ruff format --check .
	cd backend && uv run pytest -q --tb=short

# フロントエンドの静的解析・テスト・本番ビルド検証
check-frontend:
	cd frontend && npm run -s lint
	cd frontend && npm run -s test
	cd frontend && npm run -s build

# 開発サーバー起動
dev-backend:
	cd backend && uv run uvicorn main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

dev:
	npm run dev
