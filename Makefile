.PHONY: check check-root check-backend check-frontend setup-hooks dev dev-backend dev-frontend

# Git Hooks の自動登録と実行権限付与
setup-hooks:
	@git config core.hooksPath .githooks 2>/dev/null || true
	@chmod +x .githooks/* 2>/dev/null || true

# AI・開発者共通のワンコマンド全方位検証ゲート (脆弱性監査・静的解析・テスト・ビルド)
check: setup-hooks check-root check-backend check-frontend
	@echo "✅ All AI-Native quality gates (Security Audit, Ruff, Pytest, Oxlint, Vitest, Build) passed!"

# ルートの依存関係セキュリティ監査
check-root:
	npm audit --audit-level=high

# バックエンドの依存関係セキュリティ監査・静的解析・フォーマット検査・単体/統合テスト
check-backend:
	cd backend && uv run pip-audit
	cd backend && uv run ruff check .
	cd backend && uv run ruff format --check .
	cd backend && uv run pytest -q --tb=short

# フロントエンドの依存関係セキュリティ監査・静的解析・テスト・本番ビルド検証
check-frontend:
	cd frontend && npm audit --audit-level=high
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
