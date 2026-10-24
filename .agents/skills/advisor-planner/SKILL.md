---
name: advisor-planner
description: >-
  Use this skill when tackling complex architectural changes or multi-phase tasks
  by separating the workflow into an Advisor (design & verification) phase and a Worker (implementation) phase.
---

# Advisor & Worker Workflow Skill — Thin Orchestrator Pattern

このスキルは、メインエージェントの高コストなコンテキストとトークン消費を温存し、俊敏で低コストなサブエージェント（Flash / Flash-Lite）へ安全にタスクを委譲しながら高品質な開発を遂行するための「**Thin Orchestrator（薄型指揮・委譲）パターン**」です。

## 🎯 Thin Orchestrator の3大原則

1. **親（Advisor）は頭脳に徹する**: 親エージェントはアーキテクチャ設計・タスク分割・最終レビュー・意思決定のみを担当し、コードのファイル編集やテスト・ビルドコマンドの直接連打を極力避けて Flash サブエージェントに委譲します。
2. **既存サブエージェントの `send_message` 再利用**: 同一タスク内でサブエージェントを新規起動（`invoke_subagent`）するとプロンプトやコンテキストの初期化コストが発生します。既に起動済みのサブエージェントがある場合は `send_message` で次の指示を送り、会話セッションを再利用してトークンを節約します。
3. **返答の30行以内サマリー制限**: サブエージェントから親への報告は、生ログ・長大なDiff・コマンド全出力を貼り付けず、「変更概要・検証結果（`make check`成否）・作成Issue/PR・残課題」を30行以内の構造化マークダウンで返却し、親のコンテキスト肥大化を防止します。

---

## 📋 実行ステップ

### 1. 難易度・影響範囲の分析（アドバイザーフェーズ）
- プロジェクトのドキュメントや [AGENTS.md](file:///AGENTS.md) を確認し、変更対象のレイヤー（Backend/Frontend/DB/Docs）を特定します。

### 2. タスク分割とモデル選定（委譲設計）
- タスクの性質に応じて、委譲先サブエージェントのモデルを決定します：
  - **`Model: "flash_lite"`**: コードベース検索、ファイルパス探索、ログ確認、ドキュメント要約などの軽量リードオンリー作業。
  - **`Model: "flash"`**: 定型コード実装、ユニットテスト作成、コマンド実行、`make check` 検証、GitHub Issue/PR起票などのワーカー作業。
  - **親自身（Advisor）**: 複雑なアーキテクチャ設計、不確実性の高い判断、最終的なユーザー合意形成。

### 3. 実装と委譲（ワーカーフェーズ）
- **調査タスク**: メイン会話のコンテキスト汚染を防ぐため、`research`（`Model: "flash_lite"`）に調査を委譲し、必要な要点のみを受け取ります。
- **実装・ドキュメント更新**: `invoke_subagent`（`Model: "flash"`）を起動してトピックブランチ作成・コード実装・ドキュメント同期更新・`make check`・コミットまでを一任します（**Worker自身はマージを行わない**）。
- **継続指示**: 次のバッチや微修正が必要な場合は新規起動せず、既存の会話IDへ `send_message` を送信して継続実行させます。

### 4. 独立コードレビュー & マージ（アドバイザーフェーズ）
- 通常モード: 親エージェントはサブエージェントから返却された30行以内のサマリーを確認し、`git diff main...<branch>` を5大観点（①要件整合性、②純粋関数・責務分離、③セキュリティ/エラー処理、④テスト妥当性、⑤ドキュメント追従）で独立レビューします。
- レビューが承認（APPROVED）された後、親エージェントが `main` へ `--no-ff` マージして `git push origin main` を行い、ブランチを削除します。

### 5. One-Pass Flash Review & Fix 運用（高効率モード）
- 緊急対応や定型改修など、ターン数とトークン消費を最小化したい場合、親エージェントは指示時に「One-Pass」を指定します。
- この場合、Flashサブエージェントがトピックブランチ作成・実装・`make check`・5大観点自己レビュー・修正・`REVIEW_APPROVED=1 git merge --no-ff` マージ・`git push origin main` までを1パスで完結させ、親へ25行以内のサマリーで一括完了報告を行います。
