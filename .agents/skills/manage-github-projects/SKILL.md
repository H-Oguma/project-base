---
name: manage-github-projects
description: >-
  Use this skill when the user asks to create GitHub Issues, manage GitHub Projects, or when the /github slash command is invoked. It provides instructions on how to use the GitHub CLI (gh) for project management.
---

# Manage GitHub Projects & Issues

このスキルは、プロジェクト内のタスク管理（GitHub Issues / Projects）を円滑に行うための手順書です。

## 前提条件
- `gh` (GitHub CLI) がインストールされ、認証済みであること (`gh auth status` で確認)。

## 1. Issueの起票
Issueを作成する際は、タイトルと内容を明確にし、必要に応じてラベルを付与します。
```bash
gh issue create \
  --title "[プレフィックス]: タイトル" \
  --body "詳細な内容" \
  --label "enhancement" # または bug, documentation など
```
> [!TIP]
> 既存の `create_issues.sh` が存在する場合は、そのスクリプト内のIssue作成内容を参照してプロジェクト固有の要件を把握してください。

## 2. Projectの確認とIssueの追加
作成したIssueをGitHub Projects (V2) に追加する手順です。

1. **プロジェクト一覧の取得**
   まずはリポジトリのオーナーが持つプロジェクトの番号(`ID`)を確認します。
   ```bash
   gh project list --owner <リポジトリのオーナー名>
   ```

2. **Issueの追加**
   対象となるプロジェクト番号と、作成したIssueのURLを指定して追加します。
   ```bash
   gh project item-add <プロジェクト番号> --owner <リポジトリのオーナー名> --url <IssueのURL>
   ```

## 3. レポート
Issueの作成やProjectへの追加が完了したら、作成されたIssueのリンク（URL）をユーザーに提示し、次に進めるべきタスクについて確認してください。
