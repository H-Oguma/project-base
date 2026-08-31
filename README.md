# AI-Driven Development Base Project

> Last Updated: 2026-08-24

このリポジトリは、**AI駆動開発（AI-Driven Development）**をスムーズに行うためのベースプロジェクト（テンプレート）です。
Cursor、Windsurf、GitHub Copilot、Cline などのAIアシスタントと協働することを前提とした設定が組み込まれています。

## 理念 (Core Philosophy)
**「人間には寛容に、AIには厳格に」**
人間がタスクを起票する際のラベル付け忘れ等は許容しますが、AIが作業を引き継ぐ際はフックによって厳格にルール（優先度・サイズ評価など）を強制します。人間を煩雑な管理から解放しつつ、AIの暴走はシステムレベルで防ぐ設計思想です。

## 🌟 特徴

- **多層防御によるAI統制 (Antigravity 2.0)**: `AGENTS.md`（メタドキュメント/原則）、`.agents/rules/`（規約）、`.agents/hooks.json`（Hooksによる物理的強制）の4層アーキテクチャでAIの暴走・ルール逸脱を機械的に防止。
- **Issue / PR 駆動開発の自動化**: スキル（`/start`, `/pr`）とHooks連携により、Issue起票からブランチ作成、PR作成、コードレビューまでのフローを標準化・自動化。
- **マルチエージェント協調**: 実装エージェントとレビューエージェント（`reviewer`）の役割分担により、高品質なコード生成を実現。
- **CI/CD & 品質ゲート**: 自動テスト・Lint・フォーマットチェック、ビルド検証、PRタイトル検証による厳格な品質担保。
- **統一されたタスクランナー (`package.json`)**: AIや開発者が迷わずテストやLintを実行できる統一インターフェース。

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
│   └── test_main.py  # バックエンドのテストコード
├── frontend/         # フロントエンドアプリケーション (React + Vite)
│   ├── src/          # UIコンポーネント・ロジック
│   ├── public/       # 静的ファイル
│   └── package.json  # フロントエンドの依存関係とスクリプト
├── docs/             # 各種ドキュメント（詳細は docs/README.md を参照）
│   ├── architecture/ # システム・AIアーキテクチャ設計
│   ├── setup/        # 環境構築・リポジトリ設定
│   └── troubleshooting/# トラブル解決・Hooks関連
├── scripts/          # プロジェクト全体のセットアップ等のユーティリティスクリプト
├── docker-compose.yml# 本番ビルドなどの動作確認用（ローカル開発は uv/npm で直接実行）
├── package.json      # タスクランナー (setup, lint, test, dev などの共通コマンド)
├── AGENTS.md         # [AI専用] エージェントがプロジェクトを理解するためのメタドキュメント
└── README.md         # 本ドキュメント (プロジェクト概要)
```

## 📖 ドキュメント

プロジェクトの設計書、AIワークフロー、セットアップ手順などの詳細は `docs/` ディレクトリにまとめられています。

| 読者 | おすすめの入り口 |
|---|---|
| **初めてこのリポジトリを見る方** | 本 README を一読した後、[ドキュメント一覧 (`docs/README.md`)](docs/README.md) へ |
| **開発に参加・貢献したい方** | [開発・貢献ガイド (`CONTRIBUTING.md`)](CONTRIBUTING.md) |
| **テンプレートとして使い始めたい方** | 下記の「🚀 使い方」セクション → [セットアップ Playbook (`docs/setup/antigravity-setup-playbook.md`)](docs/setup/antigravity-setup-playbook.md) |
| **設計や技術的な判断の経緯を知りたい方** | [システム設計書 (`docs/architecture/system-design.md`)](docs/architecture/system-design.md) → [AIアーキテクチャ設計書 (`docs/architecture/ai-architecture.md`)](docs/architecture/ai-architecture.md) |

## 🚀 使い方

このリポジトリをテンプレートとして使用し、新しいプロジェクトを開始してください。

```bash
# 1. テンプレートからリポジトリを作成・クローン後、ディレクトリに移動
cd your-new-project

# 2. 初期化スクリプトの実行（プロジェクト名の置換、依存関係のインストール、Git Hooksの再設定が行われます）
npm run setup

# 3. テストとLintの実行確認
npm run test
npm run lint

# 4. ローカル開発サーバーの起動（フロント・バックエンド同時起動）
npm run dev
# ※ 停止する場合はターミナルで Ctrl+C を押してください

# 5. GitHub リポジトリを作成し、Pushする
gh repo create your-new-project --public --source=. --remote=origin --push
```

## 🔄 Issue・PR 駆動開発のフロー

本プロジェクトは GitHub Issue と PR を使った開発を推奨しています。用意されている AI エージェント用スキルを活用し、以下のフローで開発を進めてください。

1. **タスクの開始 (`/start` コマンドの活用)**:
   AIアシスタント（エージェント）に対して **「`/start [タスク内容]`」** と指示すると、内部の `task-init` スキルが作動し、以下を自動化します。
   - GitHub に新規 Issue を起票
   - `<prefix>/issue-<番号>-<short-name>`（例: `feature/issue-123-xxx`, `fix/issue-123-xxx` 等）という名前の作業ブランチを作成してチェックアウト
2. **実装とテスト**:
   作成されたブランチ上で、AIと共に実装を進めます。`npm run test` で品質を確認します。
3. **Pull Requestの作成 (`/pr` コマンドの活用)**:
   実装完了後、AIアシスタントに **「`/pr`」** または **「PRを作成して」** と指示すると、内部の `create-pr` スキルが作動し、GitHubのテンプレート（`.github/PULL_REQUEST_TEMPLATE.md`）に沿った正しいフォーマットで起票します。フォーマットを無視して直接作成しようとするとHooksによってブロックされる仕組みになっています。

## 🤖 AIエージェントへの指示方法

AIアシスタントに作業を依頼する際は、以下の点に留意してください。

- **「まずは `AGENTS.md` を読んでください」** と指示すると、AIがプロジェクト構造を素早く理解します。
- テストを実行させたい場合は **「`npm run test` で確認して」** と指示してください。

## ⚠️ License

MIT License (適宜変更してください)


## Docker Environment
本プロジェクトの Dockerfile は、マルチステージビルドおよび非rootユーザー環境（`appuser`, `nginx`）で構築されており、セキュアな本番運用を前提とした構成になっています。
