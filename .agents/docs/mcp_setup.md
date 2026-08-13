# MCP サーバー セットアップガイド

本プロジェクトでは、AIエージェントの能力を拡張するために MCP (Model Context Protocol) サーバーを利用します。このドキュメントでは、特によく使用される **GitHub MCP サーバー** の導入手順と、必要な **PAT (Personal Access Token)** の取得方法について解説します。

---

## 1. GitHub MCP サーバーの設定

GitHub のリポジトリ操作（Issue/PRの作成、コードの読み書きなど）をAIエージェントに行わせるためには、`@modelcontextprotocol/server-github` を導入する必要があります。
**セキュリティ上の理由から、GitHubの認証トークンを含む設定はプロジェクト内（`.agents/mcp_config.json`）にはコミットせず、各開発者のローカル環境（グローバル設定）で行ってください。**

### 設定手順
1. ローカルPCの `~/.gemini/config/mcp_config.json` をエディタで開きます。
2. 以下の設定を追記します。
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-github"
         ],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "ここに取得したPATを貼り付ける"
         }
       }
     }
   }
   ```
3. 設定を保存後、Antigravity 2.0 などのAIクライアントを再起動するか設定を再読み込みしてください。

---

## 2. GitHub PAT (Personal Access Token) の取得方法

MCP サーバーを利用するには、GitHub アカウントから PAT を発行する必要があります。

### PATの発行手順
1. GitHub にログインし、右上のプロフィールアイコンから **Settings** を選択します。
2. 左側のサイドバーの一番下にある **Developer settings** をクリックします。
3. 左側のメニューから **Personal access tokens** を展開し、用途に合わせてトークンを作成します。

---

## 3. トークンの使い分け: Classic vs Fine-grained

PAT には2種類あります。チームの開発方針や個人のセキュリティ要件に合わせて選択してください。

### A. Personal access tokens (classic)
設定が簡単で、手軽に導入したい場合におすすめです。

- **メリット**: `repo` スコープにチェックを入れるだけで、すべてのリポジトリに対する読み書き権限を一括で付与でき、エラーが起きにくいです。
- **デメリット**: 権限が広すぎるため、万が一トークンが漏洩した際に、アクセス可能な全てのリポジトリに影響が及ぶリスクがあります。
- **設定方法**: 「Generate new token (classic)」を選択し、**`repo`** (Full control of private repositories) のチェックボックスをオンにして作成します。

### B. Fine-grained personal access tokens（推奨）
特定のリポジトリだけにアクセスを許可できるため、より安全な運用が可能です。

- **メリット**: AIエージェントに操作させたい特定のリポジトリだけに権限を限定できるため、セキュリティ上のリスクを最小限に抑えられます。
- **デメリット**: 権限を細かく設定する必要があり、初回セットアップの手間が少し増えます。
- **設定方法**: 「Generate new token」を選択し、以下の設定を行ってください。
  - **Repository access**: `Only select repositories` を選び、対象となるリポジトリを指定します。
  - **Permissions (Repository permissions)**:
    - `Contents`: **Read and write** (コードの読み書きに必要)
    - `Issues`: **Read and write** (Issueの読み書きに必要)
    - `Pull Requests`: **Read and write** (PRの操作に必要)
    - `Metadata`: **Read-only** (必須・自動で付与されます)

---
> [!WARNING]
> 発行されたトークン（`ghp_...` や `github_pat_...`）は、作成画面を閉じると二度と表示されません。作成後すぐにコピーして、設定ファイルに貼り付けてください。
