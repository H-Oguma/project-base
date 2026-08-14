# Antigravity 2.0 駆動開発セットアップ Playbook（単体完結版）

**このファイル 1 本を AI (Antigravity) に読ませれば、新しいプロジェクトに Issue 起票 → 実装 → PR → レビュー → リリースの環境を展開できる**ことを目標にしたドキュメントです。

> AI へ: 新規プロジェクトの立ち上げ時や環境構築時には、上から順に Step 0 → 4 を実行してください。各 Step のテンプレートはそのままコピーし、`<>` で囲んだ箇所と「★ 書き換え」印の箇所だけプロジェクトに合わせて置換してください。判断が要る箇所は推測で埋めずユーザーに聞いてください。

---

## 0. 全体像

### 指示を 4 層に分ける

自然言語の指示は**守られることもあれば守られないこともある**ため、確実に守らせたいものほど下の層（機械が実行する層）に置きます。
Antigravity 2.0 では、この4層を以下のようにマッピングします。

```text
 層                         置き場所（Antigravity）               性質
────────────────────────────────────────────────────────────────────────────
① 原則（作法・コスト規律）  AGENTS.md / ~/.gemini/GEMINI.md      全プロジェクト共通・お願いベース
② 索引（どこに何があるか）  AGENTS.md / .agents/rules/           ポインタのみ・実体を書かない
③ 規約（このリポの決まり）  .agents/rules/conventions.md         スキルが実行時に Read する
④ 強制（守らせる）          .agents/hooks.json + hooks           ツール呼び出しを実際に deny する
────────────────────────────────────────────────────────────────────────────
 手順（再現可能な作業）     .agents/skills/<name>/SKILL.md       呼ばれたときだけ文脈に載る
```

原則:
- **上ほど汎用・下ほど具体。** 同じ内容を複数層に書かない（乖離源になる）。
- **機械で止められるものは④に置く。**「レビューしてから push」は①では守られないが、④なら 100% 止まる。
- **①②③は "正本へのポインタ" に徹する。** 内容を書き写した瞬間、更新漏れで嘘になる。
- **Antigravity は `AGENTS.md` をクロスツールの共有面として公式に読みます。** そのため、②③の基点は `AGENTS.md` に置くのがベストです。

---

## Step 0. 前提の確認

作業前にプロジェクトの基本情報を取得します。

```bash
gh auth status                      # login が本人アカウントか
git rev-parse --show-toplevel       # リポジトリルート
git remote                          # remote 名（origin 固定と決めつけない）
gh repo view --json defaultBranchRef # base ブランチ
find . -type f | wc -l && find . -type f \( -path '*/.venv/*' -o -path '*/node_modules/*' \) | wc -l
```

最後の行は対象外ファイルの比率を確認するためのものです（AI に Glob の除外指定を守らせやすくする効果があります）。

---

## Step 1. グローバル層（①②）を用意する

### 1-1. `AGENTS.md`（テンプレート）

プロジェクトルートに `AGENTS.md` を作成し、プロジェクト全体のルールとポインタを定義します。

~~~markdown
# AI Context & Global Rules

## 1. グローバルルール (Global Engineering Standard)
- **言語**: 回答やコード内のコメント、コミットメッセージは原則として**日本語**を使用してください。
- **環境**: ローカル環境での動作確認や実行は、原則として仮想環境や Docker を使用してください。
- **基本ワークフロー**: 実作業を始める前に Issue を起票し、必ず最新の `main` からブランチを切って作業を行うこと。

## 2. 業務モジュール（作業の主軸）
どのモジュールの話かを最初に確定させること。各モジュールの仕様は正本を読む:
| モジュール | 仕様の正本 |
|---|---|
| <モジュールA> | `docs/modules/<a>.md` |

## 3. サブエージェント活用によるコスト最適化
メインのコンテキストが肥大化すると毎ターン全体を再送してレートを消費します。重い読み込み・探索・調査はサブエージェントへ逃がし、メインは「結論の統合・判断・実際の編集」に専念してください。
- 横断検索・命名調査は `research` サブエージェント（読み取り専用）に委譲し、結論だけ受け取ります。
- 委譲プロンプトには対象パスか除外パスを必ず書きます（例: `node_modules/` を除外）。

## 4. 成果物の置き場所（原則）
**調査結果・検証メモ・運用手順は対象リポジトリに置かず `~/Repositories/memo/<プロジェクト>/` 配下に置く。**
リポジトリ側に置くのは成果物として残すべきもの（コード・仕様書・`docs/` の正式ドキュメント）だけにします。

## 5. 外向きの文章の書き味（PR レビュー等）
- 棘がなく、かつ卑屈でない低姿勢で書く。
- 断罪語を使わず、ヘッジは控えめに。修正案は「こうすべき」ではなく「こうする手もあります」と提案する。

## 6. 機密
- ルート直下の `<secret-file>` の内容を読み出さない・出力しない・引用しない。
- 顧客名・個人情報を Issue / PR に含めない。
~~~

---

## Step 2. 規約層（③）を作る

### 2-1. `.agents/rules/conventions.md`

`AGENTS.md` が肥大化するのを防ぐため、具体的な開発フロー規約は別ファイルに置きます。

~~~markdown
# <project> 開発フロー規約

## A. ブランチ命名とベース
- ベース: `<main>`
- ブランチ名: `<prefix>/<Issue番号>-<short-name>`
- prefix: 機能追加 `feature/` / バグ修正 `fix/` / ドキュメント `docs/` / リファクタ `refactor/`

## B. PR
- base は必ず `<main>` を明示。既定で `--draft`。
- 本文は 60 行以内を目安。調査ログ・検証データは本文でなく PR コメントへ。

## C. Issue
- 起票前に `gh issue list` で重複確認。
- 親の完了条件に含まれない不具合を見つけた場合は、sub-issue ではなく独立 Issue にする。

## D. コミット / タイトル様式
- Conventional Commits + scope + 末尾に Issue 番号、本文は日本語。
- `<type>(<scope>): <要約> (#<番号>)`

## E. lint / test
- lint: `<LINT_CMD>` (チェックのみのコマンド。format不可)
- test: `<TEST_CMD>`
~~~

---

## Step 3. 強制層（④）— push 前ゲートを敷く

ここが **この構成の中核** です。ルールで「レビューしてから」と書いても破られることがあるため、機械的に止めます。
エージェントへのフック（`.agents/hooks.json`）と、git 自身の hook を併用します。

### 3-1. git pre-push hook の設定 (あらゆる環境で有効)

```bash
git config core.hooksPath .githooks
mkdir -p .githooks && chmod +x .githooks/pre-push
```

`.githooks/pre-push` の内容:
```bash
#!/usr/bin/env bash
# .githooks/pre-push — エージェント依存のない push 前ゲート
set -uo pipefail

[ "${SKIP_PUSH_GATE:-}" = "1" ] && exit 0

have_update=0
while read -r _lref lsha _rref _rsha; do
  case "$lsha" in
    0000000000000000000000000000000000000000) ;;
    *) have_update=1 ;;
  esac
done
[ "$have_update" -eq 1 ] || exit 0

repo_root="$(git rev-parse --show-toplevel)" || exit 0
cd "$repo_root" || exit 0
log="$(mktemp -t push-gate.XXXXXX)"

run_check() {
  local label="$1"; shift
  printf '\n===== %s =====\n' "$label" >>"$log"
  "$@" >>"$log" 2>&1
}

# ★ 書き換え: lint と test のコマンド
failed=""
run_check "lint" <LINT_CMD> || failed="lint"
[ -n "$failed" ] || run_check "test" <TEST_CMD> || failed="${failed:-test}"

if [ -n "$failed" ]; then
  {
    echo "push 前ゲート: ${failed} が失敗しました。修正してから push してください。"
    echo "--- 末尾40行 ---"
    tail -n 40 "$log"
    echo "全文: ${log}"
    echo "どうしても push が必要な場合のみ: SKIP_PUSH_GATE=1 git push ..."
  } >&2
  exit 1
fi
rm -f "$log"
exit 0
```

### 3-2. `.agents/hooks.json` によるエージェント側の制御 (Option)

Antigravity では `hooks.json` を使ってツール実行前後（`PreToolUse` など）に介入できます。
必要に応じて、`git push` を実行しようとした際に自動でコードレビュー用エージェントを走らせる設定を追加できます。

---

## Step 4. スキル層（コマンド・手順）

Antigravity 2.0 では定型作業を `.agents/skills/` に配置します。

### `task-init` スキル

作業開始時に Issue 起票とブランチ作成を強制するためのスキルです。
`.agents/skills/task-init/SKILL.md` に配置します。

~~~markdown
---
name: task-init
slash_command: start
description: >-
  Use this skill to initialize a new task. It ensures that a GitHub Issue is created and a corresponding working branch is checked out before any coding or modifications begin.
---

# Task Initialization Protocol

When you are asked to start a new task, implement a feature, fix a bug, or when the `/start` command is invoked, you MUST strictly follow this procedure before making any code changes.

## 1. Create a GitHub Issue
Use the GitHub CLI (`gh`) to create a new issue for the task.
`gh issue create --title "[Title]" --body "[Description]"`

## 2. Create and Checkout a Working Branch
Create a new branch for the task. Do NOT work directly on the `main` or `master` branch.
`git checkout -b issue-[number]-[short-description]`
~~~

---

## 5. 作業フローと指示を守らせる書き方

### 5-1. Issue 起点のフロー
```
task-init (/start)  → 実装 (サブエージェント委譲活用) → (push前ゲート自動実行) → PR作成 → マージ
```
**Issue を起点にする理由**: ブランチ名・コミット末尾・PR 冒頭の `Closes #n` が全部 Issue 番号に紐づくので、規約チェックが番号 1 個で完結するからです。

### 5-2. 指示の書き方のコツ
- **禁止だけを書かない。「代わりにこれ」を必ず添える。**
  ✕ 「リポジトリ全体を検索しないで」
  ○ 「対象パス（`src/**` `docs/**`）を委譲プロンプトに必ず書く」
- **正本を 1 つに決めて、他は全部ポインタにする。**
  同じルールを複数箇所に書くと更新漏れで矛盾が生じ、AIの挙動が不安定になります。

---

## 6. 展開チェックリスト

```
[ ] Step 0  gh auth status / base ブランチ / ファイル数の実測
[ ] Step 1  AGENTS.md を作成し、プロジェクトの概要やルールを置換
[ ] Step 2  .agents/rules/conventions.md を作成し、A〜E をプロジェクトに合わせて修正
[ ] Step 3  .githooks/pre-push を設定（★ コマンドを書き換え・chmod +x）
[ ] Step 3  git config core.hooksPath .githooks を実行
[ ] Step 4  .agents/skills/task-init/SKILL.md などのスキルを配置
[ ] 確認    実際に task-init を呼び出して Issue 起票 → ブランチ作成 → 実装 → push まで通し、ゲートが動くことを確認
```

**わざと lint を落として push し、deny されることを見る**のが一番確実なテストです。
