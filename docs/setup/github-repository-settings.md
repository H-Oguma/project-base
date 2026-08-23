# GitHub リポジトリ推奨設定ガイド

> Last Updated: 2026-08-24

プロジェクトの品質やセキュリティを保つために、リポジトリを作成した後に GitHub のブラウザ（Settings画面）で行うべき推奨設定をまとめます。

> [!NOTE]
> GitHub の設定 UI や機能名は随時アップデートされるため、記載内容と実際の画面が多少異なる場合があります。本ドキュメントは「Rulesets」等の機能に対応した最新の推奨設定です。

## 1. 一般設定 (General Settings)
リポジトリの `Settings` > `General` タブから設定します。

### Pull Requests
PR のマージ戦略とクリーンアップを自動化するための設定です。
- [x] **Allow squash merging**: `ON` （推奨）
  - コミット履歴を綺麗に保つため、デフォルトでは Squash マージのみを許可します。
- [ ] **Allow merge commits**: `OFF`
- [ ] **Allow rebase merging**: `OFF`
- [x] **Always suggest updating pull request branches**: `ON`
  - PR が古くなった場合（Base ブランチが進んだ場合）に、UI から簡単にブランチをアップデートできるようにします。
- [x] **Automatically delete head branches**: `ON`
  - マージ完了後、不要になった作業ブランチを自動で削除します。

## 2. リポジトリルール / ブランチ保護 (Repository Rulesets)
リポジトリの `Settings` > `Rules` > `Rulesets` から設定します。

> [!IMPORTANT]
> 現在 GitHub では従来の「Branch protection rules」に代わり、「Repository Rulesets」の利用が推奨されています。以下は `main` ブランチに対する推奨ルールの設定です。

1. **New branch ruleset** を作成
2. **Ruleset Name**: `Protect main branch` など任意のわかりやすい名前
3. **Enforcement status**: `Active`
4. **Target branches**: `Include by pattern` で `main` （デフォルトブランチ）を指定

### 有効にするルールの詳細 (Rules)
- [x] **Restrict deletions**: `ON`
  - 誤って `main` ブランチを削除しないように保護します。
- [x] **Block force pushes**: `ON`
  - コミット履歴の改ざんを防ぎます。
- [x] **Require a pull request before merging**: `ON`
  - **Required approvals**: `1` (またはプロジェクトの規定数)
  - **Dismiss stale pull request approvals when new commits are pushed**: `ON`
    - 新しいコミットがプッシュされた際に、過去の承認（Approve）を無効化します。
  - **Require review from Code Owners**: `ON` (CODEOWNERS ファイルを運用している場合)
- [x] **Require status checks to pass**: `ON`
  - CI/CD (lint, test 等) が成功しないとマージできないように設定します。対象となるステータスチェック（例: `lint`, `test`）を検索して必須チェックとして追加してください。
- [x] **Require conversation resolution before merging**: `ON`
  - PR 内のすべてのコメント（Conversation）が解決（Resolve）されるまでマージをブロックします。

## 3. セキュリティ設定 (Security)
リポジトリの `Settings` > `Code security and analysis` から設定します。

- [x] **Dependabot alerts**: `Enable`
  - 依存関係の脆弱性を検知します。
- [x] **Dependabot security updates**: `Enable`
  - 脆弱性を修正する PR を自動で作成します。
- [x] **Secret scanning**: `Enable`
  - ソースコード内にクレデンシャルやシークレットが誤って含まれている場合に検知します。

## 4. GitHub Actions の設定 (Actions)
リポジトリの `Settings` > `Actions` > `General` から設定します。

### Workflow permissions
- **Read and write permissions**:
  - プロジェクトで Actions からリポジトリへの Push やタグ作成を行う場合はこちらを選択します。基本はデフォルトの `Read repository contents and packages permissions` で問題ありませんが、リリース自動化等の用途に応じて変更してください。
- **Allow GitHub Actions to create and approve pull requests**: `ON`
  - Actions 経由で PR を作成する場合（例: Renovate, Dependabot, AIエージェントによる自動起票など）は必ずチェックを入れてください。
