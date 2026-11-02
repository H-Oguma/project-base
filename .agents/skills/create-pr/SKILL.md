---
name: create-pr
slash_command: pr
description: >-
  Use this skill to create a Pull Request. It enforces the usage of the project's PR template and formatting rules.
---

# Pull Request Creation Protocol

When you are asked to create a pull request, or when the `/pr` command is invoked, you MUST strictly follow this procedure.

## 1. Verify Code Review
Before creating a PR, ensure that a subagent (e.g., `reviewer`) has reviewed the code changes. If not, invoke a review first.

## 2. 実差分の確認と実態監査 (Fact Audit) ★必須
AIの記憶や当初の予定に頼ってPR本文を作成してはいけません（虚偽報告・記載漏れの原因となります）。
必ず以下のコマンドを実行し、**実際のgit差分・変更ファイル一覧**を確認してください：
```bash
git diff main...HEAD --name-status
git diff main...HEAD --stat
```
作業の途中で追加・修正したスクリプト（`.agents/scripts/`）、設定ファイル、GitHub Actions CIワークフロー（`.github/`）、Gitフック（`.githooks/`）なども漏れなく把握し、「実態差分」のみに基づいてPR本文を構成してください。

## 3. Load PR Template and Rules
Read the following files to understand the PR formatting rules:
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.agents/rules/pr-format.md`

## 4. Prepare the PR Body
Prepare the PR body string following `.github/PULL_REQUEST_TEMPLATE.md` and `.agents/rules/pr-format.md`.
You MUST fill in all sections required by the template based on your changes:
- **変更種別の厳格な選定**: ドキュメント以外（コード、スクリプト、CI、設定ファイル等）が含まれている場合、`docs (ドキュメントのみの変更)` のみをチェックしてはいけません（CIのPR実態乖離チェックで弾かれます）。
- **影響範囲の漏れなき選定**:
  - `backend/` 配下の変更がある場合 ➔ 必ず `backend` をチェック
  - `frontend/` 配下の変更がある場合 ➔ 必ず `frontend` をチェック
  - `.github/`, `.agents/`, `.githooks/`, 設定ファイル, CI等の変更がある場合 ➔ 必ず `infra` をチェック
- In `## 品質・ドキュメント`, every checkbox MUST be either `- [x]` or `- [N/A]` (leaving `- [ ]` will fail the `PR Lint` CI check). When using `- [N/A]`, fill in the reason on the next line.
- Link the related Issue using `Closes #<IssueNumber>`.
- Fill in the specific changes made and the reasons.
- List the modified files in the table matching `git diff main...HEAD --name-status`.
- Include test execution logs in the designated `<details>` block if tests were run.

## 5. Create the Pull Request via GitHub MCP
Direct execution of `gh pr create` is blocked by the guardrail hook (`.agents/scripts/enforce_pr_format.mjs`).
You MUST use the GitHub MCP tool `create_pull_request` (`ServerName: "github"`, `ToolName: "create_pull_request"`) after pushing the working branch (`git push -u origin <branch>`):
- `owner`: Repository owner (e.g., `H-Oguma`)
- `repo`: Repository name (e.g., `project-base`)
- `title`: `[<Type>] <Brief Summary>`
- `head`: Current working branch name
- `base`: `main`
- `body`: The fully formatted PR body matching `.github/PULL_REQUEST_TEMPLATE.md`
