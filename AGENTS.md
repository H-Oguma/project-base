# AI Context & Global Rules

このドキュメントは、AIアシスタント（Antigravity, Cursor, Windsurf, Cline 等）が本プロジェクトの全体像とルールを把握するためのメタドキュメント（グローバルルール）です。

## 1. グローバルルール (Global Engineering Standard)
- **言語**: 回答やコード内のコメント、コミットメッセージは原則として**日本語**を使用してください。(変数名や関数名などのコードの識別子は英語のまま維持します)
- **環境**: ローカル環境での動作確認やコマンド実行、パッケージのインストールを行う際は、原則として仮想環境（`uv` 等）を使用してください。Pythonパッケージの操作や実行には必ず `uv add` や `uv run` を用い、`pip install` や素の `python` コマンドによるグローバル環境への干渉は絶対に行わないでください。
- **基本ワークフロー**: 実作業を始める前に Issue を起票し、必ず最新の `main` からブランチを切って作業を行うこと（詳細は「5. 開発の進め方」を参照）。

## 2. プロジェクト概要
このプロジェクトは「AI駆動開発のベース（テンプレート）」として設計されています。新しいプロジェクトを開始する際の土台としてコピーして使用することを想定しています。

## 3. ディレクトリ構成
プロジェクトの主要なディレクトリとファイルは以下の通り配置されています。

```text
.
├── .agents/          # AIエージェント用の詳細ルールやスキル定義
│   ├── rules/        # 開発フロー、TDD、セキュリティなどのAI向けルール
│   ├── scripts/      # 補助スクリプト
│   └── skills/       # カスタムスキルの定義
├── .github/          # GitHub Actions (CI/CD) や Issue/PR テンプレート
├── backend/          # FastAPIベースのバックエンドアプリケーション
│   ├── main.py       # APIエンドポイント
│   ├── database.py   # DB設定
│   ├── models.py     # データモデル
│   └── test_main.py  # バックエンドテスト
├── frontend/         # React + Vite ベースのフロントエンドアプリケーション
│   ├── src/          # Reactコンポーネント
│   └── package.json  # パッケージ・スクリプト管理
├── docs/             # プロジェクトの設計書、アーキテクチャドキュメント
├── scripts/          # 開発セットアップ等のユーティリティスクリプト
├── docker-compose.yml# 本番動作確認用等のコンテナ環境定義
├── AGENTS.md         # AI用メタドキュメント（本ファイル）
└── README.md         # プロジェクト全体の概要
```

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
- **Runtime**: `uv`, Node.js (npm scripts)

## 5. 開発の進め方 (AIエージェント向け絶対遵守ルール)

**🚨【CRITICAL WARNING / 絶対禁止事項】🚨**
ユーザーから新しい作業指示を受けた際、**現在のブランチに直接ファイル編集を行うことは固く禁じます（たとえ1文字のタイポ修正であっても例外はありません）。**

AIは作業に着手する際、いかなるコード変更・コマンド実行よりも**優先して、以下の手順を必ず踏むこと。**

1. **タスク初期化の強制**: ユーザーから指示を受けたら、必ず `task-init` スキルを実行し、GitHub Issue を起票し、最新の `main` から専用の作業ブランチ（`issue-[番号]-...`）を作成すること。
2. **スラッシュコマンドの推奨**: ユーザーからの指示が `/start` コマンドで始まっていない場合でも、内部的には `/start` が呼ばれたものとして振る舞い、タスク初期化フローを開始すること。
3. **コマンドの実行**: テストやLintはルートの `package.json` のスクリプトから実行できます（例: `npm run test`、`npm run lint`）。
4. **実装とドキュメント**: 新規ブランチで作業し、必要に応じて設計書等も更新すること。
5. **レビュー**: PR作成前に、必ずコードレビュー用のサブエージェント（`reviewer`）を呼び出して品質や妥当性をレビューさせること。
6. **PR作成**: レビュー通過後、必ず `create-pr` スキル（または `/pr` コマンド）を使用してPull Requestを作成すること。※AIは決してPRを直接マージしないこと。
7. **詳細ルールの参照**: 
   - 開発フロー、TDD、セキュリティ、設計書更新などの詳細ルールは `.agents/rules/` ディレクトリ以下のファイルで定義されています。
   - 常にこれらの詳細ルールを遵守してください。
   - AIがワークフローを無視してしまう問題とその対策（Hooks設定）については、[`docs/ai-workflow-troubleshooting.md`](file:///Users/kumato/Documents/hoby/project-base/docs/ai-workflow-troubleshooting.md) を参照してください。

## 6. MCP (Model Context Protocol) 運用ガイドライン
AIエージェントの能力を拡張する MCP サーバーの設定は、セキュリティを考慮して以下のように管理してください。

1. **機密情報を含む設定 (GitHub PATなど)**
   - **絶対に `.agents/mcp_config.json` にハードコードしないでください。**
   - 個人のトークンや認証情報が必要な MCP は、リポジトリ外のグローバル設定 (`~/.gemini/config/mcp_config.json`) で管理してください。
2. **共有可能な設定 (ローカル開発DBなど)**
   - トークン漏洩のリスクがなく、開発チーム全員で共有すべき設定（例: ダミーデータ入りローカルDB接続）は、プロジェクト内の `.agents/mcp_config.json` に記述してコミットします。
