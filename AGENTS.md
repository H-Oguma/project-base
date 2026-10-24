# AGENTS.md — AI-Native Engineering Guide for project-base v2.0

> Last Updated: 2026-10-24

このリポジトリは **AI駆動開発（AI-Native Development）** のテンプレート兼マスター母艦として設計されています。
AIエージェント（および人間開発者）が機能追加・バグ修正・リファクタリングを行う際は、必ず以下の憲章と検証コマンドに従ってください。

---

## 理念 (Core Philosophy)
**「人間には寛容に、AIには厳格に」**
人間がタスクを起票する際のラベル付け忘れ等は許容しますが、AIが作業を引き継ぐ際はゼロトラスト物理フック（`.githooks/`）によって厳格にルール（ブランチ保護・コミット形式・検証通過）を機械的に強制します。人間を煩雑な管理から解放しつつ、AIの暴走はシステムレベルで防ぐ設計思想です。

---

## 1. 黄金律（Golden Rules）

1. **ワンコマンド自己検証の徹底**:
   コードを変更した後は、必ずプロジェクトルートで `make check` を実行し、すべてのチェック（バックエンド Ruff / Pytest、フロントエンド Oxlint / Vitest / Build）がパスすることを確認してから完了報告を行ってください。
2. **純粋関数と副作用の分離**:
   ビジネスロジックは極力副作用のない純粋関数として記述し、単体テストで網羅的に検証してください。DBアクセスや外部API通信などの副作用を持つ層とは疎結合を保ちます。
3. **自己マージ禁止・独立コードレビュー必須（Mandatory Independent Review Gate）**:
   実装担当サブエージェント（Worker）はトピックブランチで `make check` を通過させコミットするところまでを担当し、原則として**自分自身で `main` にマージしてはいけません**。`.githooks/pre-commit` により `main` への直接コミットおよびレビュー承認なし（`REVIEW_APPROVED=1` 未設定）のマージコミットは物理的に遮断されます。必ず親エージェント（Advisor/Reviewer）が `git diff main...<branch>` を5大観点で独立レビューし、`APPROVED` を得てからマージ（`REVIEW_APPROVED=1 git merge ...`）してください。
   ※ 例外として、親エージェントから明示的に「One-Pass」の指示を受けたFlashエージェントは、本ファイル第5.3節の規定に従い、5大観点自己レビュー・マージ・プッシュまでを1パスで完結させることが許可されます。
4. **ドキュメント追従の徹底（Doc Sync）**:
   新機能やAPI、設定の追加・変更を行った際は、必ず対応する `docs/*.md` や `README.md` を同期更新してください。
5. **日本語ドキュメント・コミット標準**:
   コード内の docstring、コメント、コミットメッセージ、PR説明文はすべて日本語で記述してください。コミットメッセージは `.githooks/commit-msg` により Conventional Commits 形式かつ日本語文字（ひらがな・カタカナ・漢字）の含有が物理的に強制されます。
6. **仮想環境の利用**:
   Python コマンドを実行する際はグローバル環境を汚さず、必ず `cd backend && uv run ...` または `make` タスク経由で実行してください。

---

## 2. ディレクトリ構造と責務

```text
.
├── .githooks/        # ゼロトラスト物理ロック (pre-commit, commit-msg, pre-push)
├── .agents/          # AIエージェント向けルール・スキル定義
│   ├── rules/        # 開発フロー、TDD、セキュリティ等のAI向け詳細ルール
│   └── skills/       # カスタムスキル (advisor-planner, task-init, issue, pr 等)
├── .github/          # GitHub Actions (CI/CD) や Issue/PR テンプレート
├── backend/          # FastAPIベースのバックエンドアプリケーション (uv 管理)
│   ├── main.py       # APIエンドポイント
│   ├── database.py   # DB設定・セッション管理
│   ├── models.py     # SQLAlchemy ORM モデル
│   └── test_main.py  # バックエンドテスト (pytest)
├── frontend/         # React 19 + Vite フロントエンドアプリケーション
│   ├── src/          # UIコンポーネント・テスト (App.test.jsx)
│   └── package.json  # パッケージ・スクリプト管理
├── docs/             # アーキテクチャ設計書・トラブルシューティング
├── Makefile          # AI・開発者共通のワンコマンド検証ハブ (`make check`, `setup-hooks`)
├── package.json      # プロジェクト全体の依存・スクリプト
└── AGENTS.md         # AI向けアーキテクチャ憲章（本ファイル）
```

---

## 3. 主要コマンド一覧

| コマンド | 説明 |
| :--- | :--- |
| `make check` | **【必須】** Gitフック登録 + Backend (Ruff, Pytest) + Frontend (Oxlint, Vitest, Build) の一括検証 |
| `make setup-hooks` | `.githooks/` をローカルリポジトリに登録し実行権限を付与 |
| `make check-backend` | バックエンドの静的解析・フォーマット検査・テストを実行 |
| `make check-frontend` | フロントエンドの静的解析・テスト・本番ビルド検証を実行 |
| `make dev` | バックエンドとフロントエンドの開発サーバーを並行起動 |

---

## 4. サブエージェント活用とコスト最適化（Zero-Waste Context 原則）

メインエージェントの高コストなコンテキストウィンドウとトークン消費を最小化するため、開発時は以下の**5大コスト最適化原則**を遵守してください：

1. **親での直接ツール連打の禁止とFlash委譲**:
   - 複数ファイルの実装、テストコマンド実行、バッチ処理などは親エージェントが直接実行せず、原則として **`Model: "flash"`** のサブエージェントを起動して一任します。親はアーキテクチャ設計・タスク分割・最終レビューに専念します。
2. **既存サブエージェントの `send_message` 再利用**:
   - 既に起動済みのサブエージェントがある場合、同一タスク内の後続作業で新たに `invoke_subagent` を呼び出してはいけません。`send_message` を使って既存エージェントに対話形式で指示を送り、初期化オーバーヘッドとトークン消費を抑制します。
3. **調査・検索タスクでの `flash_lite` 最優先活用**:
   - 生HTML構造の調査、ファイルパス探索、ログ確認などのリードオンリータスクには、最も低コスト・高速な **`Model: "flash_lite"`** を明示指定して実行します。
4. **サブエージェント返答の30行以内構造化サマリー制限**:
   - サブエージェントから親への報告メッセージには、実行コマンドの生ログや長大なDiffをそのまま貼り付けてはいけません。「変更内容」「検証結果（`make check`成否）」「Issue/PR番号」「残課題」を30行以内のMarkdownサマリーに凝縮して返答し、親のコンテキスト肥大化を防ぎます。
5. **自己解決の義務（自律修正）**:
   - Lintやテストでエラーが出た場合、または Git フックで弾かれた場合、**「エラーが出ましたが修正しますか？」とユーザーに質問することは固く禁じます。** 自力でエラーログを解析し、コードを修正して再実行し、完全にパスさせてから完了報告を行ってください。

---

## 5. Git ブランチ & PR 運用ワークフロー

`main` ブランチを常にクリーンで動作保証された状態（セーブポイント）として保つため、作業時は必ずトピックブランチを切ってください。

### 5.1. ブランチ命名規則
- **機能追加**: `feat/<short-name>`
- **バグ修正**: `fix/<short-name>`
- **リファクタリング**: `refactor/<short-name>`
- **ドキュメント・設定整備**: `chore/<short-name>` または `docs/<short-name>`
- **Issue連携**: `issue-[番号]-<short-name>`

### 5.2. 標準開発サイクル（Worker ➔ Reviewer 分離手順）
1. **ブランチ作成 (Worker)**:
   ```bash
   git switch main && git pull origin main
   git switch -c feat/<short-name>
   ```
2. **実装・ローカル検証 (Worker)**:
   - コードおよびドキュメントを変更し、必ず `make check` を実行して全テスト・ビルドがパスすることを確認します。
3. **コミット & レビュー依頼 (Worker)**:
   - 日本語 Conventional Commits 形式（`feat: ...`）でコミットします。
   - **Worker自身はマージを行わず**、親エージェント（Reviewer）へ変更サマリー（30行以内）を添えてレビュー依頼を行います。
4. **独立コードレビュー & マージ (Reviewer)**:
   - 親エージェントが `git diff main...<branch>` を5大観点（①要件整合性、②純粋関数・責務分離、③セキュリティ/エラー処理、④テスト妥当性、⑤ドキュメント追従）でレビューし、問題がなければ承認フラグ付きでマージしてプッシュします：
     ```bash
     git switch main
     REVIEW_APPROVED=1 git merge --no-ff <branch>
     git push origin main
     git branch -d <branch>
     ```

### 5.3. One-Pass Flash Review & Fix 運用
親エージェントから明示的に委譲された場合、Flashサブエージェントは以下の1パス完結フローを実行できます：
1. `main` からトピックブランチを作成し、コードとドキュメントを実装。
2. `make check` を実行し、全検証のパスを確認。
3. 日本語 Conventional Commits 形式でコミット。
4. `git diff main...<branch>` を5大観点で自己レビューし、問題があれば修正。
5. `git switch main && REVIEW_APPROVED=1 git merge --no-ff <branch> && git push origin main && git branch -d <branch>` を実行してマージ＆プッシュ。
6. 親エージェントへ25行以内の簡潔な構造化サマリーで完了報告。

---

## 6. MCP (Model Context Protocol) 運用ガイドライン

1. **機密情報を含む設定 (GitHub PATなど)**:
   - **絶対に `.agents/` 内の設定ファイルにハードコードしないでください。**
   - 個人のトークンや認証情報が必要な MCP は、リポジトリ外のグローバル設定 (`~/.gemini/antigravity/mcp/` 等) で管理してください。
2. **共有可能な設定 (ローカル開発DBなど)**:
   - トークン漏洩のリスクがなく、開発チーム全員で共有すべき設定はプロジェクト内に記述してコミットします。
