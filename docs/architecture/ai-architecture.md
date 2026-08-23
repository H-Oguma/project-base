# AI Architecture & Workflow Design

> Last Updated: 2026-08-24

本プロジェクトは、AIアシスタント（Antigravity, Cursor 等）との協働を前提とした「AI駆動開発（AI-Driven Development）」のためのベースアーキテクチャを採用しています。

このドキュメントでは、AIを効率的かつ安全に活用するためのシステム設計や設定について記録します。

## 1. エージェント用ファイル構造と階層型ルール (Antigravity 2.0 対応)

プロジェクト全体のルールやコンテキストは、ルートの `AGENTS.md` を起点とし、詳細な設定は `.agents/` ディレクトリ配下で管理されます。
Antigravity 2.0 の仕様に基づき、以下のファイル群がエージェントに読み込まれ、その振る舞いを決定・強制します。

### 1-1. ルールとコンテキスト (Rules & Context)
- **`AGENTS.md`**: 言語統一、環境の強制、Issue駆動などのグローバルな原則と、各ルールへのポインタを記載します。
- **`.agents/rules/*.md`**: 開発フロー（PRフォーマット等）、TDD、ドキュメント同期など、特定のタスク時にエージェントが参照すべき具体的な振る舞いの規約を定義します。

### 1-2. スキルと拡張 (Skills & Extensions)
- **`.agents/skills/`**: `/start` や `/pr` などのスラッシュコマンドで呼び出される定型作業（Issue起票やPR作成など）の具体的な手順を定義します。エージェントは指定されたスキルが呼ばれたときだけ、この手順を文脈にロードして実行します。
- **`.agents/scripts/`**: エージェントやHooksが利用する補助的なシェルスクリプト群です。

### 1-3. 動作の強制 (Hooks)
- **`.agents/hooks.json`**: エージェントがファイル編集やコマンド実行ツールを呼び出す直前に介在し、物理的にルール違反（`main` ブランチへの直接編集等）をブロックするための設定ファイルです。

### 1-4. 外部連携 (MCP)
- **`.agents/mcp_config.json`**: プロジェクト固有の Model Context Protocol (MCP) の設定ファイルです。（詳細は「2. Model Context Protocol (MCP) の活用」を参照）

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
