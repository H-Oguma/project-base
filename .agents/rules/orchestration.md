---
title: サブエージェント定義とオーケストレーション基準
activation: always_on
priority: high
---

# Agent Orchestration & Definitions (Gemini 4 / Plan-Execute 対応)

本プロジェクトではコスト最適化・コンテキスト分離・効率的なリソース管理を厳守する。
タスクの性質と並列度に応じて、以下の **3段階ルーティング** を使い分けること。

## 1. 実行モードとモデル選定（3段階ルーティング）

### ① 単一トピックの設計〜実装（標準）→ `Plan → Execute`（または `Orchestrator`）
- ハーネス標準の **Plan-Execute（2フェーズ自動切替）** または **Antigravity `Orchestrator`（Planner: Gemini 4 Neon / Executor: Gemini 4 Hydrogen）** を基本とする。
- Plan フェーズは read-only 調査・設計判断・検証条件定義・最終レビューに徹し、編集・ビルド・`make check` 実行は Execute フェーズが担う。
- **二重委譲の禁止**: 既に Execute フェーズで動作中の場合、単一タスクのために不要な実装サブエージェントを入れ子起動しない（1〜2ファイル修正や単発質問も直接対応）。

### ② コンテキスト隔離が必要な探索・独立レビュー → `invoke_subagent`
`invoke_subagent` の `Model` 引数は抽象ティア（4択）のみ受け付ける（具体モデル名の直指定は不可）。

| モデルティア | コスト | 選定基準 |
|:--|:--|:--|
| `flash_lite` | 最安 | 広域コード探索、生ログ確認、ドキュメント Fresh-Eyes レビュー（暗黙知検出） |
| `flash` | 安価 | 単体高推論モデル使用時（Plan-Execute 非使用時）の分離実装・テスト実行・通常レビュー |
| `inherit` | 標準 | 複雑な設計判断や高度な推論が必要な委譲タスク |
| `pro` | 高価 | **ユーザーが明示的に指示した場合のみ使用可** |

### ③ 並列マルチタスク（Backend + Frontend 同時改修、多観点並列レビュー等）→ `swarm`
`swarm` は `workspace: "share"`（ビルド・DB 競合防止）と**具体モデル指定**が可能（利用可能モデルと残量は `swarm(action="models")` で確認）。
- **設計統括・高難度デバッグ・厳密レビュー**: `Gemini 4 Neon` 系（`high` / `xhigh`）または `Orchestrator (Neon / Argon)`
- **並列実装・テストワーカー**: `Gemini 4 Hydrogen` 系（`medium` / `high`）または `Gemini 4 Argon` 系（`medium` / `high`）
- **軽量探索・定型処理**: `Gemini 3.8 Flash` 系や `low` / `medium` ティア
- **クォータ枠への配慮**: 現行環境では `Gemini 4 Neon`・`Gemini 4 Hydrogen`・`Gemini 3.8 Flash`・`Orchestrator (Neon)` が同一クォータ枠を共有し、`Gemini 4 Argon` 系・`Orchestrator (Argon)` 等が別枠となる傾向がある。委譲の目的は「コンテキスト分離・並列化・レイテンシ短縮」とし、大規模並列時は別枠モデル（`Argon` 系等）への分散も活用する。

---

## 2. 委譲時の役割定義（`invoke_subagent` / `swarm` 用）

コンテキスト分離や並列作業で `define_subagent` / `invoke_subagent` / `swarm` を用いる場合、以下の役割定義に準拠する（単線タスクの Execute フェーズでは不要に分割起動しない）：

### 🔍 researcher（コードベースリサーチャー）
- **推奨モデル**: `flash_lite`（広域探索・構造把握）または `flash`（複合分析）
- **書き込み/MCP**: なし（`enable_write_tools: false`, `enable_mcp_tools: false`）
- **役割**: コードベース調査、Web検索、影響範囲の確認。
- **システムプロンプトの指示**: 日本語で回答し、調査結果は箇条書きで構造化し、絶対パスを使用する。

### 🛠️ worker（実装ワーカー）
- **推奨モデル**: `flash`（単発分離委譲）または `inherit` / `swarm`（`Gemini 4 Hydrogen` / `Argon` 系）
- **書き込み/MCP**: あり（`enable_write_tools: true`, `enable_mcp_tools: true`）
- **役割**: コード実装、テスト作成、コマンド実行。
- **システムプロンプトの指示**: ルール（セキュリティ、TDD、ドキュメント）を遵守し、ネイティブ環境（`uv`, `npm`）を使用する。並列作業時は `Workspace: "share"` 等で競合を防止する。

### 📋 reviewer（コードレビュアー）
- **推奨モデル**: `flash`（コード/セキュリティレビュー）、`flash_lite`（ドキュメント Fresh-Eyes レビュー）、または `Gemini 4 Neon` / `inherit`（厳密監査）
- **書き込み/MCP**: なし（`enable_write_tools: false`, `enable_mcp_tools: false`）
- **役割**: PR作成前の必須レビュー、セキュリティチェック、実態監査（Fact Audit）。
- **システムプロンプトの指示**: `security.md` を基準にし、指摘事項は重大度・ファイル行番号・修正提案の形式で報告する。また、**PR本文や報告サマリーが実際のgit差分（`git diff main...HEAD --name-status`）と乖離していないか（コードだけでなく設定・CI・スクリプト等の追加修正が漏れなく報告されているか）**を必ず突き合わせ監査する。

### ✅ tester（テストランナー）
- **推奨モデル**: `flash`
- **書き込み/MCP**: 書き込みのみあり（テスト実行とログ出力のため）、MCP不要。
- **役割**: テスト実行、結果分析。
- **システムプロンプトの指示**: `Makefile`（`make check`）や `package.json` の npm scripts を使用し、結果を30行以内の構造化サマリーで報告する。

### 📝 planner（設計アドバイザー）
- **推奨モデル**: `inherit`（または Plan フェーズ / `Gemini 4 Neon` 系）
- **書き込み/MCP**: なし
- **役割**: 設計方針の立案、技術選定、タスク分解。
- **システムプロンプトの指示**: プロジェクト技術スタックを前提とし、複数の案を比較して提示する。

---

## 3. 運用ルール（オーケストレーション）

- **再利用とリソース解放**:
  新しいサブエージェントを呼ぶ前に `manage_subagents` (`list`) で `idle` 状態の同種エージェントを探して `send_message` で再利用する。目的が達成されたら速やかに `manage_subagents` (`kill`) で解放する。
- **モデル選択**:
  `invoke_subagent` の調査・Fresh-Eyes レビューは `flash_lite`、分離実行・レビューは `flash` を基準とし、不十分な場合のみ `inherit` へエスカレーションする。`pro` はユーザー明示時のみ。
- **ワークスペース**:
  原則 `Workspace: "inherit"`。並列ビルド・並列テストや破壊的検証が必要な場合のみ `"share"` または `"branch"` を使用する。
- **標準的な開発フロー**:
  作業着手時は必ず以下の手順を遵守すること。
  1. (Plan / 親エージェント) **Issue起票**: 対応方針を含めてIssueを作成する。
  2. (Plan / 親エージェント) **ブランチ作成**: `main` を最新化（`pull`）してから `issue-<番号>` を含む作業用ブランチを切る。
  3. (Execute / ワーカー群) **新規ブランチで作業**:
     - 標準の単一タスクは Plan → Execute へ引き継いで実装・テスト・`make check` を完結させる（重複委譲しない）。
     - 探索・並列改修・大規模分離が必要な場合のみ `researcher` (`flash_lite`/`flash`)・`planner` (`inherit`)・`worker` (`flash` または `swarm` の `Hydrogen`/`Argon`)・`tester` (`flash`) を活用する。
  4. (reviewer) **対応内容のレビュー & 実態監査 (Fact Audit)**: PR作成前の必須レビュー（セキュリティ・TDD・ドキュメント対応の要否に加え、報告内容やPR本文と実差分 `git diff main...<branch> --name-status` の突き合わせ監査を行い、虚偽報告や漏れがないことを検証する。指摘時は修正へ戻す）。
  5. (親エージェント) **PR作成**: レビューをパスしたら `create-pr` スキルに従って PR を作成する。
