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

## 3. Create a Temporary PR Body File
Create a temporary markdown file (e.g., `tmp_pr_body.md`) containing the PR body.
You MUST fill in all sections required by the template based on your changes.
- Check the appropriate checkboxes (change type, impact area).
- Link the related Issue using `Closes #<IssueNumber>`.
- Fill in the specific changes made and the reasons.
- List the modified files in the table.
- Include test execution logs in the designated `<details>` block if tests were run.

## 4. Create the Pull Request
Use the GitHub CLI (`gh`) to create the PR, referencing the temporary file you just created.
```bash
gh pr create --title "[<Type>] <Brief Summary>" --body-file tmp_pr_body.md
```
Note: Do not use the `--body` argument directly with a short string. You must use `--body-file` and provide a fully formatted body.

## 5. Cleanup
After the PR is successfully created, remove the temporary file.
```bash
rm tmp_pr_body.md
```
