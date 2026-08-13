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
```bash
gh issue create --title "[Brief Task Title]" --body "[Detailed description of the task based on user request]"
```
If an issue for this task already exists, skip this step and use the existing issue number.

## 2. Create and Checkout a Working Branch
Create a new branch for the task. Do NOT work directly on the `main` or `master` branch.
The branch name should follow the format: `issue-[number]-[short-description]`
```bash
git checkout -b issue-[number]-[short-description]
```

## 3. Report and Execute
Once the issue is created and the branch is checked out, report the created issue URL and branch name to the user. Then proceed with creating an implementation plan or directly executing the task.
