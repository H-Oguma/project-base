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

## 2. Load PR Template and Rules
Read the following files to understand the PR formatting rules:
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.agents/rules/pr-format.md`

## 3. Prepare the PR Body
Prepare the PR body string following `.github/PULL_REQUEST_TEMPLATE.md` and `.agents/rules/pr-format.md`.
You MUST fill in all sections required by the template based on your changes:
- Check the appropriate checkboxes (change type, impact area).
- Link the related Issue using `Closes #<IssueNumber>`.
- Fill in the specific changes made and the reasons.
- List the modified files in the table.
- Include test execution logs in the designated `<details>` block if tests were run.

## 4. Create the Pull Request via GitHub MCP
Direct execution of `gh pr create` is blocked by the guardrail hook (`.agents/scripts/enforce_pr_format.mjs`).
You MUST use the GitHub MCP tool `create_pull_request` (`ServerName: "github"`, `ToolName: "create_pull_request"`) after pushing the working branch (`git push -u origin <branch>`):
- `owner`: Repository owner (e.g., `H-Oguma`)
- `repo`: Repository name (e.g., `project-base`)
- `title`: `[<Type>] <Brief Summary>`
- `head`: Current working branch name
- `base`: `main`
- `body`: The fully formatted PR body matching `.github/PULL_REQUEST_TEMPLATE.md`
