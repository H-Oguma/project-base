---
slash_command: github
description: "GitHubのIssue作成・検索・管理、およびProjectsへの登録を行うためのコマンドです。"
---

# GitHub Issues & Projects Management

このプロジェクトでは、タスク管理および進捗管理に **GitHub Issues** と **GitHub Projects** を活用します。
`/github` コマンドが呼び出された場合、またはIssue・Projectに関する指示を受けた場合は、以下のガイドラインに従って `gh` (GitHub CLI) を用いて操作してください。

## 1. Issueの管理

### Issueの作成
タスクを新たに起票する場合は以下のコマンドを使用します。
```bash
gh issue create --title "[タイトル]" --body "[本文]" --label "[ラベル]"
```
- プロジェクトルートの `.github/ISSUE_TEMPLATE/` などを参考に、適切な情報を含めてください。
- すでに `create_issues.sh` のような一括作成スクリプトがある場合は、必要に応じてそれを実行・拡張することも検討してください。

### Issueの確認・検索
```bash
gh issue list --state open
gh issue view <issue-number>
```

## 2. Projects (V2) の管理

GitHub ProjectsにIssueを登録・管理する場合は以下のコマンドを使用します。

### プロジェクトの確認
現在のオーナー（ユーザーまたはOrganization）が持つプロジェクトの一覧を取得します。
```bash
gh project list --owner <owner-name>
```

### プロジェクトへのアイテム（Issue）追加
作成したIssueをプロジェクトに追加するには、プロジェクトのID番号とIssueのURL（または番号）を使用します。
```bash
gh project item-add <project-number> --owner <owner-name> --url <issue-url>
```
※ `<owner-name>` にはリポジトリのオーナー名（例: `H-Oguma`）を指定します。

## 3. エージェントの振る舞い
- コマンド実行前には必ず `gh auth status` でログイン状態が正常か（あるいは `gh` コマンドが使えるか）を確認してから操作を進めてください。
- Issueを作成した後は、そのURLとIssue番号をユーザーに報告してください。
- Projectsをまだ作成していない場合は、ユーザーに「GitHubブラウザ上からProject(V2)を作成してください」と案内してください（CLIからの新規Project(V2)作成は複雑なため）。
