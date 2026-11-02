---
name: task-init
slash_command: start
description: >-
  Use this skill to initialize a new task. It ensures that a GitHub Issue is created and a corresponding working branch is checked out before any coding or modifications begin.
---

# Task Initialization Protocol

When you are asked to start a new task, implement a feature, fix a bug, or when the `/start` command is invoked, you MUST strictly follow this procedure before making any code changes.

## 1. Search Past Issues for Knowledge Reuse
Before creating a new issue, search past issues (including closed ones) to learn from previous bug fixes, decisions, or to prevent duplicate work.
Prefer using the GitHub MCP tool `search_issues` if available. Otherwise, use the GitHub CLI (`gh`) to search for related keywords in the current repository:
```bash
gh issue list --search "your keywords" --state all --limit 10
```
Review the results to see if the problem was already solved or if there are existing workarounds or related discussions.

## 2. Create a GitHub Issue
- **親Issueが存在するサブIssueの場合（重要）:**
  GitHub MCP ツール（`create_issue`）は Sub-issue 機能（`--parent`）に未対応のため、**必ず GitHub CLI (`gh`) の `--parent <親Issue番号>` を使用して起票してください**（ワークフックにより強制されます）。
  ```bash
  gh issue create --parent <親Issue番号> --title "[Task]: [Brief Subtask Title]" --body "## 概要\n[詳細な説明]\n\n親Issue: #<親Issue番号>" --label "enhancement,P2: Normal,Size: S"
  ```
- **親Issueのない通常の新規Issueの場合:**
  GitHub MCP ツール `create_issue` が利用可能であれば優先して使用し、なければ GitHub CLI (`gh`) で作成します。
  ```bash
  gh issue create --title "[Brief Task Title]" --body "[Detailed description of the task based on user request]" --label "enhancement,P2: Normal,Size: M"
  ```
If an issue for this task already exists, skip this step and use the existing issue number.

**IMPORTANT:** Once the issue is created, you MUST link it to the project board using the following command:
```bash
gh project item-add 1 --owner <Repository-Owner> --url <Created-Issue-URL>
# Example: gh project item-add 1 --owner H-Oguma --url https://github.com/H-Oguma/project-base/issues/123
```

## 3. Create and Checkout a Working Branch
Create a new branch for the task. Do NOT work directly on the `main` or `master` branch.
You MUST pull the latest changes from the `main` branch before creating a new working branch.
The branch name should follow the format: `<prefix>/issue-<Issue番号>-<short-name>` (where prefix is `feature/`, `fix/`, `docs/`, `refactor/`, or `chore/`).
```bash
git checkout main
git pull origin main
git checkout -b <prefix>/issue-<number>-<short-description>
```

## 4. Report and Execute
Once the issue is created, linked to the project, and the branch is checked out, report the created issue URL and branch name to the user. Then proceed with creating an implementation plan or directly executing the task.
