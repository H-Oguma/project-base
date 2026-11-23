---
name: advisor-planner
description: >-
  Use this skill when tackling complex architectural changes or multi-phase tasks
  by separating the workflow into an Advisor (design & verification) phase and a Worker (implementation) phase.
---

# Advisor & Worker Workflow Skill — Thin Orchestrator Pattern (Gemini 4 / Plan-Execute)

このスキルは、**Plan → Execute 2フェーズ運用（または Antigravity `Orchestrator`）** を基本としつつ、タスク規模・並列度に応じて **`invoke_subagent`** と **`swarm`** を適切に使い分け、親のコンテキスト汚染を防ぎながら高品質な開発を遂行するための「**Thin Orchestrator（薄型指揮・委譲）パターン**」です。

## 🎯 Thin Orchestrator の3大原則

1. **設計・レビューと実装・検証の分離**: Plan フェーズ（上位推論モデル）はアーキテクチャ設計・タスク分割・最終レビューに徹し、実装・テスト・`make check` 実行は Execute フェーズまたは必要に応じた Worker に任せます。既に Execute フェーズで動作中の場合、単一タスクのために不要な実装サブエージェントを入れ子起動しないでください。
2. **既存サブエージェント／ワーカーの `send_message` 再利用**: 同一タスク内で追加修正や再テストを行う際は新規起動を避け、既存の会話ID・メンバーへ `send_message`（または Swarm ボード）で継続指示を送り初期化コストを削減します。
3. **返答の30行以内構造化サマリー制限**: サブエージェント／ワーカーから親への報告は、生ログ・長大な Diff・コマンド全出力を貼り付けず、「変更概要・検証結果（`make check` 成否）・作成Issue/PR・残課題」を30行以内の構造化マークダウンで返却し、親のコンテキスト肥大化を防ぎます。

---

## 📋 実行ステップ

### 1. 難易度・影響範囲の分析（Plan / Advisor フェーズ）
- [AGENTS.md](../../../AGENTS.md) および [orchestration.md](../../rules/orchestration.md) を確認し、変更対象のレイヤー（Backend / Frontend / Infra / Docs）を特定します。

### 2. 実行モードとモデル選定（3段階ルーティング）
タスクの性質に応じて、以下の3段階から最適な実行モードを選定します：

1. **単一トピックの設計〜実装（標準）→ `Plan → Execute`（または `Orchestrator`）**
   - ハーネス標準の **Plan フェーズ（`Gemini 4 Neon` 等の推論モデル）** で read-only 調査・設計確定・検証条件の定義を行い、`exit_plan_mode` で **Execute フェーズ（`Gemini 4 Hydrogen` 等の高速実行モデル）** へ引き継ぎます（1〜2ファイルの軽微な修正や単発質問も直接対応）。
2. **大規模調査・Fresh-Eyes レビュー（コンテキスト分離）→ `invoke_subagent`**
   - `invoke_subagent` の `Model` 引数は抽象ティア指定（`"inherit"` / `"pro"` / `"flash"` / `"flash_lite"`）のみ受け付け、具体モデル名の直指定は不可です。
   - **`Model: "flash_lite"`（`research` 等）**: 広域コード探索、生ログ確認、`docs/` の前提知識なしレビュー（Fresh-Eyes Review）。
   - **`Model: "flash"`（必要に応じて `"inherit"`）**: 単体高推論モデル使用時（Plan-Execute 非使用時）や独立した単一モジュールの実装・テスト・`make check` 検証をコンテキスト分離して委譲する場合。
3. **並列マルチタスク（Backend + Frontend 同時改修、多観点並列レビュー等）→ `swarm`**
   - `swarm` は `workspace: "share"`（ビルド・ファイル競合防止）と**具体モデル名**の指定が可能です（利用可能モデル・残量は `swarm(action="models")` で確認）。
   - **役割別モデル選定指針**:
     - 設計統括・高難度デバッグ・厳密レビュー: `Gemini 4 Neon` 系（`high` / `xhigh`）または `Orchestrator (Neon / Argon)`
     - 並列実装・テストワーカー: `Gemini 4 Hydrogen` 系（`medium` / `high`）または `Gemini 4 Argon` 系（`medium` / `high`）
     - 軽量探索・定型処理: `Gemini 3.8 Flash` 系や `low` / `medium` ティア
   - **クォータ枠への配慮**: 現行環境では `Gemini 4 Neon`・`Gemini 4 Hydrogen`・`Gemini 3.8 Flash`・`Orchestrator (Neon)` が同一クォータ枠を共有し、`Gemini 4 Argon` 系・`Orchestrator (Argon)` 等が別枠となる傾向があります。委譲は「クォータ節約」ではなく「**コンテキスト分離・並列化・レイテンシ短縮**」のために使い、並列数が多い場合は別枠モデル（`Argon` 系等）への分散も活用します。

### 3. 実装と検証（Execute / Worker フェーズ）
- Issue 番号を含むトピックブランチ（`feature/issue-<番号>-<short-name>` 等）を作成し、コード実装・`docs/` 同期更新・`make check` 通過・日本語 Conventional Commits 形式でのコミットまでを実施します（**実装担当ワーカー自身は `main` へのマージを行わない**）。
- 複数ワーカーを並行稼働させる場合は `Workspace: "share"`（`swarm` では `workspace: "share"`）または `"branch"` を活用し、ビルドやテスト成果物の競合を防ぎます。

### 4. 独立コードレビュー & 実態監査（Fact Audit） & マージ（Advisor / Reviewer フェーズ）
- 通常モード: Reviewer は返却された30行以内のサマリーと `git diff main...<branch>` を確認し、以下5大観点＋実態監査（Fact Audit）で独立レビューします：
  1. **要件整合性**: Issue・設計方針を満たしているか
  2. **純粋関数・責務分離**: 副作用の分離と静的解析（`ruff` / `oxlint`）を満たしているか
  3. **セキュリティ・エラー処理**: `security.md` 基準や入力検証・例外処理が適切か
  4. **テスト妥当性**: 正常系・異常系・境界値テストが十分か
  5. **ドキュメント追従 & Fact Audit**: `docs/` が更新され、報告サマリーや PR 本文が `git diff main...<branch> --name-status` の実態と完全一致しているか
- レビューが承認（APPROVED）された後、親エージェント／Reviewer が `main` へ `--no-ff` マージ（`REVIEW_APPROVED=1 git merge --no-ff <branch>`）して `git push origin main` を行い、ブランチを削除します（または `create-pr` スキルで PR を作成してマージ）。

### 5. One-Pass Review & Fix 運用（高効率モード）
- 緊急対応や計画確定済みの定型改修など、ターン数とトークン消費を最小化したい場合、Plan フェーズ／親エージェントは指示時に「One-Pass」を指定します。
- この場合、Executor / Worker（または実行用サブエージェント）がトピックブランチ作成・実装・`make check`・上記5大観点＋Fact Audit 自己レビュー・修正・`REVIEW_APPROVED=1 git merge --no-ff` マージ・`git push origin main` までを1パスで完結させ、親へ25行以内のサマリーで一括完了報告を行います。
