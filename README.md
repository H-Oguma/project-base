# AI-Driven Development Base Project

> Last Updated: 2026-08-24

このリポジトリは、**AI駆動開発（AI-Driven Development）**をスムーズに行うためのベースプロジェクト（テンプレート）です。
Cursor、Windsurf、GitHub Copilot、Cline などのAIアシスタントと協働することを前提とした設定が組み込まれています。

## 🌟 特徴

- **AIコンテキスト (`AGENTS.md`)**: AIがプロジェクトの全体像を即座に把握するためのメタドキュメント。
- **AIツール仕様 (`docs/architecture/antigravity-2.0-specs.md`)**: エージェント（Antigravity 2.0等）の操作や設定に関する仕様ドキュメント。
- **グローバルルール (`.cursorrules`)**: AIエージェントに一貫した振る舞い（テスト駆動、日本語回答など）を強制。
- **CI/CDパイプライン**: 自動テスト・自動Lintの整備により、AIが生成したコードの品質を担保。
- **統一されたタスクランナー (`Makefile`)**: AIが迷わずテストやLintを実行できるエントリーポイント。

## 📁 ディレクトリ構成

本プロジェクトの主要なディレクトリとファイルの構成は以下の通りです。

```text
.
├── .agents/          # [AI専用] エージェント向けの設定・ルール群（人間が読む必要はありません）
│   ├── rules/        # AI向けの各種ルール（開発フロー、テスト、セキュリティ等）
│   ├── scripts/      # AIが使用する補助スクリプト
│   └── skills/       # AIエージェントの独自スキル定義
├── .github/          # GitHub Actions のワークフローおよび Issue/PR テンプレート
├── backend/          # バックエンドアプリケーション (FastAPI)
│   ├── main.py       # APIのエンドポイント・ルーティング
│   ├── database.py   # DB接続・セッション管理
│   ├── models.py     # SQLAlchemy ORM モデル
│   ├── test_main.py  # バックエンドのテストコード
│   └── Dockerfile    # バックエンド用コンテナビルド設定
├── frontend/         # フロントエンドアプリケーション (React + Vite)
│   ├── src/          # UIコンポーネント・ロジック
│   ├── public/       # 静的ファイル
│   ├── package.json  # フロントエンドの依存関係とスクリプト
│   └── Dockerfile    # フロントエンド用コンテナビルド設定
├── docs/             # 各種ドキュメント（詳細は docs/README.md を参照）
│   ├── architecture/ # システム・AIアーキテクチャ設計
│   ├── setup/        # 環境構築・リポジトリ設定
│   └── troubleshooting/# トラブル解決・Hooks関連
├── scripts/          # プロジェクト全体のセットアップ等のユーティリティスクリプト
├── docker-compose.yml# 本番ビルドなどの動作確認用（ローカル開発は uv/npm で直接実行）
├── Makefile          # タスクランナー (setup, lint, test, up などの共通コマンド)
├── AGENTS.md         # [AI専用] エージェントがプロジェクトを理解するためのメタドキュメント
└── README.md         # 本ドキュメント (プロジェクト概要)
```

## 📖 ドキュメント

プロジェクトの設計書、AIワークフロー、セットアップ手順などの詳細は `docs/` ディレクトリにまとめられています。

| 読者 | おすすめの入り口 |
|---|---|
| **初めてこのリポジトリを見る方** | 本 README を一読した後、[ドキュメント一覧 (`docs/README.md`)](docs/README.md) へ |
| **テンプレートとして使い始めたい方** | 下記の「🚀 使い方」セクション → [セットアップ Playbook (`docs/setup/antigravity-setup-playbook.md`)](docs/setup/antigravity-setup-playbook.md) |
| **設計や技術的な判断の経緯を知りたい方** | [システム設計書 (`docs/architecture/system-design.md`)](docs/architecture/system-design.md) → [AIアーキテクチャ設計書 (`docs/architecture/ai-architecture.md`)](docs/architecture/ai-architecture.md) |

## 🚀 使い方

このリポジトリをテンプレートとして使用し、新しいプロジェクトを開始してください。

```bash
# 1. テンプレートからリポジトリを作成・クローン後、ディレクトリに移動
cd your-new-project

# 2. 初期化スクリプトの実行（プロジェクト名の置換、依存関係のインストール、Git Hooksの再設定が行われます）
make setup

# 3. テストとLintの実行確認
make test-all
make lint

# 4. ローカル開発サーバーの起動（フロント・バックエンド同時起動）
make up
# ※ 停止する場合はターミナルで Ctrl+C を押してください

# 5. GitHub リポジトリを作成し、Pushする
gh repo create your-new-project --public --source=. --remote=origin --push
```

## 🔄 Issue・PR 駆動開発のフロー

本プロジェクトは GitHub Issue と PR を使った開発を推奨しています。用意されている AI エージェント用スキルを活用し、以下のフローで開発を進めてください。

1. **タスクの開始 (`/start` コマンドの活用)**:
   AIアシスタント（エージェント）に対して **「`/start [タスク内容]`」** と指示すると、内部の `task-init` スキルが作動し、以下を自動化します。
   - GitHub に新規 Issue を起票
   - `issue-[番号]-[概要]` という名前の作業ブランチを作成してチェックアウト
2. **実装とテスト**:
   作成されたブランチ上で、AIと共に実装を進めます。`make test-all` で品質を確認します。
3. **Pull Requestの作成 (`/pr` コマンドの活用)**:
   実装完了後、AIアシスタントに **「`/pr`」** または **「PRを作成して」** と指示すると、内部の `create-pr` スキルが作動し、GitHubのテンプレート（`.github/PULL_REQUEST_TEMPLATE.md`）に沿った正しいフォーマットで起票します。フォーマットを無視して直接作成しようとするとHooksによってブロックされる仕組みになっています。

## 🤖 AIエージェントへの指示方法

AIアシスタントに作業を依頼する際は、以下の点に留意してください。

- **「まずは `AGENTS.md` を読んでください」** と指示すると、AIがプロジェクト構造を素早く理解します。
- テストを実行させたい場合は **「`make test-all` で確認して」** と指示してください。

## ⚠️ License

MIT License (適宜変更してください)
