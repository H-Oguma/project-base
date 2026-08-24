---
name: issue
description: >-
  Use this skill when the user asks to create a GitHub Issue to add to the backlog, or when the /issue slash command is invoked. This skill ONLY creates the issue and evaluates Priority/Size, without checking out a branch.
---

# Issue 起票アシスタント (/issue コマンド)

このスキルは、ユーザーのアイデアやタスクをバックログ（GitHub Issues）に素早く登録するための手順です。
`/start`（タスク着手）とは異なり、**作業ブランチの作成（`git checkout -b`）は行わず、Issueの起票のみ**を行います。

## ワークフロー

### 1. ユーザーの入力内容の整理
ユーザーから `/issue ログイン画面にパスワードリセット機能を追加したい` などの指示を受けたら、まずはその内容を整理し、適切なタイトルと概要を決定します。
内容が不明確な場合は、起票前にユーザーに質問して要件を詰めてください。

### 2. 優先度とサイズの自動評価 ★必須
このプロジェクトでは、すべてのIssueに「優先度」と「サイズ」のラベルが必須です。ユーザーの指示内容からAIが自律的に評価し、以下のどれに該当するかを決定してください。

**優先度 (Priority)**
- `P0: Blocker` (本番障害など、最優先)
- `P1: High` (スプリント内の主目標)
- `P2: Normal` (通常タスク)
- `P3: Low` (余裕があれば/Nice to have)

**サイズ (Size)**
- `Size: S` (数ファイルの修正、数十分〜1時間程度)
- `Size: M` (1つの機能追加、半日〜1日程度)
- `Size: L` (エピック級、複数のサブタスクに分割が必要)

### 3. Issueの起票 (`gh` コマンド または MCP の使用)
評価が終わったら、実際にIssueを起票します。必ず評価したラベルを含めてください。

**CLIで起票する場合の例:**
```bash
gh issue create \
  --title "[Task]: パスワードリセット機能の追加" \
  --body "## 概要\nログイン画面にパスワードを忘れたユーザーのためのリセット導線を追加する。\n\n## 要件\n- メール送信機能\n- リセット用トークンの発行" \
  --label "enhancement,P2: Normal,Size: M"
```
※ `MCP` ツール（`github` サーバーの `create_issue`）を使用して起票しても構いません。その場合も `labels` 引数に優先度とサイズのラベルを必ず配列で渡してください。

### 4. ユーザーへの報告
起票が完了したら、作成されたIssueのリンク（URL）と、AIが評価した優先度・サイズをユーザーに報告してタスクを完了します。
> 例: 「Issue #123 を起票しました！今回のタスクは『Size: M』『P2: Normal』として評価・ラベリングしています。着手する際はお声がけください。」

> Last Updated: 2026-08-24
