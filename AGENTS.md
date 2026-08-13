# AI Context & Global Rules

このドキュメントは、AIアシスタント（Antigravity, Cursor, Windsurf, Cline 等）が本プロジェクトの全体像とルールを把握するためのメタドキュメント（グローバルルール）です。

## 1. グローバルルール (Global Engineering Standard)
- **言語**: 回答やコード内のコメント、コミットメッセージは原則として**日本語**を使用してください。(変数名や関数名などのコードの識別子は英語のまま維持します)
- **環境**: ローカル環境での動作確認やコマンド実行、パッケージのインストールを行う際は、原則として仮想環境（venvなど）や Docker を使用してください。グローバル環境に直接インストールや実行を行わないでください。
- **基本ワークフロー**: 実作業を始める前に Issue を起票し、必ず最新の `main` からブランチを切って作業を行うこと（詳細は「5. 開発の進め方」を参照）。

## 2. プロジェクト概要
このプロジェクトは「AI駆動開発のベース（テンプレート）」として設計されています。新しいプロジェクトを開始する際の土台としてコピーして使用することを想定しています。

## 3. ディレクトリ構成
- `.agents/`: AIエージェント用の詳細ルールやスキル定義
- `.github/`: GitHub Actions (CI/CD) や Issue/PR テンプレート
- `backend/`: FastAPIベースのバックエンドアプリケーション
- `frontend/`: React + Vite ベースのフロントエンドアプリケーション
- `docs/`: プロジェクトの設計書、アーキテクチャドキュメント

## 4. 技術スタック
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
- **Container**: Docker, Docker Compose (`docker-compose.yml`)

## 5. 開発の進め方 (AIエージェント向け)
1. **コマンドの実行**: テストやLintはルートの `Makefile` から実行できます。
   - 例: `make test-all`, `make lint`
2. **AIの担当範囲とワークフロー**:
   AIは作業に着手する際、**必ず**以下の手順を踏むこと：
   1. **Issue起票**: 対象タスクのGitHub Issueを作成する。その際、タスクの目的と**対応方針**を必ずIssueの本文に記載すること。
   2. **ブランチ作成**: ベースブランチ（`main`など）に移動して最新状態に更新（`pull`）してから、作業用の新規ブランチを切ること。
   3. **新規ブランチで作業**: コードの実装やテストコードの作成などを新しいブランチ上で行う。
   4. **対応内容のレビュー**: Pull Requestを作成する前に、必ずコードレビュー用のサブエージェント（`reviewer`）を呼び出して品質や妥当性をレビューさせること。指摘事項がある場合は修正する。
   5. **PR作成**: レビュー通過後、Pull Requestを作成する。※AIは決してPRを直接マージしないこと（マージは人間のApproveを経て行われる）。
3. **詳細ルールの参照**: 
   - 開発フロー、TDD、セキュリティ、設計書更新などの詳細ルールは `.agents/rules/` ディレクトリ以下のファイルで定義されています。
   - 常にこれらの詳細ルールを遵守してください。

## 6. MCP (Model Context Protocol) 運用ガイドライン
AIエージェントの能力を拡張する MCP サーバーの設定は、セキュリティを考慮して以下のように管理してください。

1. **機密情報を含む設定 (GitHub PATなど)**
   - **絶対に `.agents/mcp_config.json` にハードコードしないでください。**
   - 個人のトークンや認証情報が必要な MCP は、リポジトリ外のグローバル設定 (`~/.gemini/config/mcp_config.json`) で管理してください。
2. **共有可能な設定 (ローカル開発DBなど)**
   - トークン漏洩のリスクがなく、開発チーム全員で共有すべき設定（例: ダミーデータ入りローカルDB接続）は、プロジェクト内の `.agents/mcp_config.json` に記述してコミットします。
