# AI Architecture & Workflow Design

本プロジェクトは、AIアシスタント（Antigravity, Cursor 等）との協働を前提とした「AI駆動開発（AI-Driven Development）」のためのベースアーキテクチャを採用しています。

このドキュメントでは、AIを効率的かつ安全に活用するためのシステム設計や設定について記録します。

## 1. 階層型ルールの適用 (Antigravity 2.0 対応)

プロジェクト全体のルールやコンテキストは、ルートディレクトリの `AGENTS.md`（旧 `AI_CONTEXT.md`）によって管理されています。
Antigravity 2.0 の仕様に基づき、ディレクトリ階層をさかのぼって自動的にルールが適用される仕組みを利用しています。

- **`AGENTS.md`**: 言語統一、環境の強制、Issue駆動などのグローバルルール。
- **`.agents/rules/*.md`**: セキュリティ、TDD、ドキュメント同期などの詳細な振る舞いを定義。

## 2. Model Context Protocol (MCP) の活用

AIエージェントに外部システムとの連携能力を持たせるため、MCP (Model Context Protocol) を導入しています。

### MCP設定の分離とセキュリティ
機密情報の漏洩を防ぐため、MCPの設定は以下の2層構造で管理します。

1. **プロジェクト固有の設定 (`.agents/mcp_config.json`)**
   - リポジトリにコミットされる設定。
   - トークン漏洩のリスクがない、ローカル開発環境用の設定のみを記載します。
   - 例: ローカルの PostgreSQL / SQLite コンテナへの接続。

2. **グローバル設定 (`~/.gemini/config/mcp_config.json`)**
   - 各開発者のローカルマシンにのみ存在する設定。
   - GitHubのパーソナルアクセストークン（PAT）など、機密情報を含む設定はこちらで行います。
   - 例: `@modelcontextprotocol/server-github` の設定。

## 3. 推奨されるMCPサーバー
本プロジェクトの開発体験を向上させるために、以下のMCPサーバーの導入を各開発者に推奨しています。

- **GitHub MCP Server**
  - 用途: Issueの検索・起票、PRの操作。
  - 設定場所: グローバル設定 (`~/.gemini/config/mcp_config.json`)
- **PostgreSQL / SQLite MCP Server**
  - 用途: データベースのスキーマ確認、ダミーデータのクエリによるバグ調査。
  - 設定場所: プロジェクト設定 (`.agents/mcp_config.json`)
- **Puppeteer MCP Server**
  - 用途: フロントエンド（React）画面の描画確認、E2Eテストの補助。
