# AI Context Document

このドキュメントは、AIアシスタントが本プロジェクトの全体像とアーキテクチャを迅速に把握するためのメタドキュメントです。

## プロジェクト概要
このプロジェクトは「AI駆動開発のベース（テンプレート）」として設計されています。新しいプロジェクトを開始する際の土台としてコピーして使用することを想定しています。

## ディレクトリ構成
- \`.agents/\`: AIエージェント用のルールセット（セキュリティ、TDD、ドキュメント要件など）
- \`.github/\`: GitHub Actions (CI/CD) や Issue/PR テンプレート
- \`backend/\`: FastAPIベースのバックエンドアプリケーション
- \`frontend/\`: React + Vite ベースのフロントエンドアプリケーション
- \`docs/\`: プロジェクトの設計書、アーキテクチャドキュメント

## 技術スタック
### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Testing**: Vitest, React Testing Library
- **Linter**: oxlint

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Testing**: pytest
- **Linter/Formatter**: ruff

### Infrastructure
- **Container**: Docker, Docker Compose (\`docker-compose.yml\`)

## 開発の進め方 (AIエージェント向け)
1. **ルールの確認**: 開発を始める前に \`.cursorrules\` および \`.agents/rules/\` を確認してください。
2. **コマンドの実行**: テストやLintはルートの \`Makefile\` から実行できます。
   - 例: \`make test-all\`, \`make lint\`
3. **Issue駆動**: 実装方針が定まらない場合は、Issueを作成（または読み込み）、要件を整理してからコードの変更を行ってください。
