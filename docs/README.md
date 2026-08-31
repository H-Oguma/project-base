# プロジェクト ドキュメント一覧

> Last Updated: 2026-08-24

ここは本プロジェクト（AI駆動開発ベース）の各種ドキュメントを格納するディレクトリです。目的に応じて以下のドキュメントを参照してください。

## 1. システム設計と仕様
- **[システム設計書 (system-design.md)](./architecture/system-design.md)**
  アーキテクチャ、データベース設計（Schema）、API設計（Endpoints）、フロントエンド設計など、システムの実装に関する仕様をまとめた設計書です。実装の変更に伴い、常に最新化されます。

## 2. AI開発ワークフローと設定
- **[AI Architecture & Workflow Design (ai-architecture.md)](./architecture/ai-architecture.md)**
  AIアシスタントとの協働を前提とした「AI駆動開発」のための階層型ルール（AGENTS.md）の適用や、MCP (Model Context Protocol) の活用方法についてのシステム設計と設定を記録しています。
- **[AIワークフロー強制に関するトラブルシューティング (ai-workflow-troubleshooting.md)](./troubleshooting/ai-workflow-troubleshooting.md)**
  AIエージェントが定めたルールやワークフローを無視して直接編集してしまう問題への対策として導入されている「Hooks」の仕組みと、過去のトラブル解決についてまとめています。

## 3. セットアップ・仕様書
- **[Antigravity 2.0 駆動開発セットアップ Playbook (antigravity-setup-playbook.md)](./setup/antigravity-setup-playbook.md)**
  新しいプロジェクトに Issue 起票 → 実装 → PR → レビュー → リリースの環境を展開するための、AI向けの単体完結版セットアップ手順書です。
- **[Antigravity 2.0 仕様 (antigravity-2.0-specs.md)](./architecture/antigravity-2.0-specs.md)**
  エージェントのアクティビティを起動・監視するためのデスクトップ Electron アプリケーション「Antigravity 2.0」のUI構成や権限設定に関する仕様書です。
- **[GitHub リポジトリ推奨設定ガイド (github-repository-settings.md)](./setup/github-repository-settings.md)**
  プロジェクトの品質やセキュリティを保つために、ブラウザの Settings 画面から行うべき推奨設定（Rulesets や自動削除など）をまとめています。
- **[MCP サーバー セットアップガイド (mcp-setup.md)](./setup/mcp-setup.md)**
  AIエージェントの能力を拡張する MCP サーバー（GitHub MCP等）の導入手順と PAT 発行手順についてのガイドです。

## 4. 開発・貢献ガイド
- **[開発・貢献ガイド (CONTRIBUTING.md)](../CONTRIBUTING.md)**
  開発環境のセットアップ、ブランチ運用、コミットメッセージ規約、テスト・Lintの実行方法、PR作成フローをまとめた人間・開発者向けの総合ガイドです。
