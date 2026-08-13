# AI Context & Global Rules

このドキュメントは、AIアシスタント（Antigravity, Cursor, Windsurf, Cline 等）が本プロジェクトの全体像とルールを把握するためのメタドキュメント（グローバルルール）です。

## 1. グローバルルール (Global Engineering Standard)
- **言語**: 回答やコード内のコメント、コミットメッセージは原則として**日本語**を使用してください。(変数名や関数名などのコードの識別子は英語のまま維持します)
- **環境**: ローカル環境での動作確認やコマンド実行、パッケージのインストールを行う際は、原則として仮想環境（venvなど）や Docker を使用してください。グローバル環境に直接インストールや実行を行わないでください。
- **ブランチ操作**: 作業を開始し、新しくブランチを作成する際は、必ずベースブランチ（`main`など）に移動して最新の状態を `pull` してからブランチを切るようにしてください。（コンフリクトを未然に防ぐため）
- **Issue駆動**: 実作業（コード修正やコマンド実行など）を開始する前には、必ず対象となるタスクの GitHub Issue を起票し、タスクの目的を明確にしてから進めるようにしてください。

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
2. **詳細ルールの参照**: 
   - 開発フロー、TDD、セキュリティ、設計書更新などの詳細ルールは `.agents/rules/` ディレクトリ以下のファイルで定義されています。
   - 常にこれらの詳細ルールを遵守してください。
