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
Prefer using the GitHub MCP tool `create_issue` if available. Otherwise, use the GitHub CLI (`gh`) to create a new issue for the task.
```bash
gh issue create --title "[Brief Task Title]" --body "[Detailed description of the task based on user request]"
```
If an issue for this task already exists, skip this step and use the existing issue number.

**IMPORTANT (Sub-issues):** If the new task is a sub-task of an existing parent issue (e.g. splitting a `Size: L` epic), you MUST create it with `gh issue create --parent <parent-number>` so that it is linked as a GitHub **Sub-issue** (parent/child metadata). Writing `親Issue: #N` in the body alone does NOT create the link. Do NOT use the MCP `create_issue` tool for sub-issues because it cannot set the parent (the hook will block it). Also include `親Issue: #<parent-number>` in the body.
```bash
gh issue create --parent 123 --title "[Brief Task Title]" --body "... 親Issue: #123" --label "P2: Normal,Size: S"
# 既存Issueを後から紐付ける場合: gh issue edit <child-number> --parent <parent-number>
# 紐付けの確認: gh issue view <child-number> --json parent
```
See the "サブIssueの紐付け" section in `.agents/rules/task-management.md` for details.

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
