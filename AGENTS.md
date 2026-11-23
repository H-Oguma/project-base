# AGENTS.md — AI-Native Engineering Guide for project-base v2.0

> Last Updated: 2026-11-23

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
   実行フェーズ／実装ワーカー（Executor / Worker）はトピックブランチで `make check` を通過させコミットするところまでを担当し、原則として**自分自身で `main` にマージしてはいけません**。`.githooks/pre-commit` により `main` への直接コミットおよびレビュー承認なし（`REVIEW_APPROVED=1` 未設定）のマージコミットは物理的に遮断されます。必ず親エージェント／Plan フェーズ（Advisor / Reviewer）が `git diff main...<branch>` を5大観点＋実態監査（Fact Audit: 報告と実差分の突き合わせ）で独立レビューし、`APPROVED` を得てからマージ（`REVIEW_APPROVED=1 git merge ...`）してください。
   ※ 例外として、Plan フェーズ／親エージェントから明示的に「One-Pass」の指示を受けた Executor / Worker は、本ファイル第5.3節の規定に従い、5大観点自己レビュー・マージ・プッシュまでを1パスで完結させることが許可されます。
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
├── .agents/          # AIエージェント向けルール・スキル・ガードレール定義
│   ├── rules/        # 開発フロー、TDD、セキュリティ等のAI向け詳細ルール
│   ├── scripts/      # ワークフロー強制スクリプト (enforce_workflow.mjs 等)
│   └── skills/       # カスタムスキル (task-init, issue, create-pr, advisor-planner, agents-md-management)
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
| `make check` | **【必須】** Gitフック登録 + セキュリティ監査 + Backend (pip-audit, Ruff, Pytest) + Frontend (npm audit, Oxlint, Vitest, Build) の一括検証 |
| `make setup-hooks` | `.githooks/` をローカルリポジトリに登録し実行権限を付与 |
| `make check-root` | ルートの依存関係セキュリティ監査 (`npm audit`) を実行 |
| `make check-backend` | バックエンドのセキュリティ監査・静的解析・フォーマット検査・テストを実行 |
| `make check-frontend` | フロントエンドのセキュリティ監査・静的解析・テスト・本番ビルド検証を実行 |
| `make dev` | バックエンドとフロントエンドの開発サーバーを並行起動 |

---

## 4. マルチエージェント運用とコスト・コンテキスト最適化（Gemini 4 / Plan-Execute 対応）

### 4.1. 実行モードとモデルの使い分け（3段階ルーティング）
1. **単一トピックの設計〜実装（標準）→ `Plan → Execute`（または `Orchestrator`）**:
   - ハーネス標準の **Plan-Execute（2フェーズ自動切替）** または **Antigravity `Orchestrator`（Planner: Gemini 4 Neon / Executor: Gemini 4 Hydrogen）** を基本とし、Plan フェーズで read-only 調査・設計判断・検証条件を確定して Execute フェーズへ引き継ぎます（1〜2ファイルの軽微な修正や単発質問も直接対応）。
   - **二重委譲の禁止**: 既に Execute フェーズで動作中の場合、単一タスクのために不要な実装サブエージェントを入れ子起動しないでください。
2. **大規模調査・Fresh-Eyes レビュー（コンテキスト分離）→ `invoke_subagent`**:
   - `invoke_subagent` の `Model` 引数は抽象ティア指定（`"inherit"` / `"pro"` / `"flash"` / `"flash_lite"`）のみ対応します。広域探索・生ログ確認・`docs/` の暗黙知レビュー（Fresh-Eyes）には `Model: "flash_lite"` を最優先で用い、単体高推論モデル使用時（Plan-Execute 非使用時）や独立モジュールの分離実装・検証のみ `Model: "flash"`（必要に応じ `"inherit"`）へ委譲します。
3. **並列マルチタスク（Backend + Frontend 同時改修等）→ `swarm`**:
   - `swarm` は `workspace: "share"`（ビルド競合防止）と具体モデル指定が可能（詳細は [`.agents/rules/orchestration.md`](.agents/rules/orchestration.md) を参照）。設計・厳密レビューは `Gemini 4 Neon` 系 / `Orchestrator (Neon / Argon)`、並列実装は `Gemini 4 Hydrogen` 系または `Gemini 4 Argon` 系、軽量処理は `Gemini 3.8 Flash` 系を使い分け、大規模並列時は別クォータ枠（`Argon` 系等）への分散も活用します。

### 4.2. Zero-Waste Context 5大原則
1. **Plan-Execute の自然な分離と二重委譲の禁止**: Plan は設計・レビューに徹し、実装・ビルド検証は Execute または必要時の Worker に任せます。
2. **既存エージェントの `send_message` 再利用**: 同一タスク内の後続作業は新規起動せず、`send_message` で既存エージェントを再利用して初期化コストを抑制します。
3. **探索・ログ確認・Fresh-Eyes での `flash_lite` 最優先活用**: リードオンリー探索や暗黙知検出レビューには `Model: "flash_lite"` を指定します。
4. **サブエージェント返答の30行以内構造化サマリー制限**: 生ログや長大なDiffを貼らず、「変更内容」「検証結果（`make check` 成否）」「Issue/PR 番号」「残課題」を30行以内で返却します。
5. **自己解決の義務（自律修正）**: Lint やテスト・Git フックでエラーが出た場合、自力で原因を解析・修正して再実行し、パスを確認してから完了報告を行います（同一エラーは2回まででエスカレーション）。

---

## 5. Git ブランチ & PR 運用ワークフロー

`main` ブランチを常にクリーンで動作保証された状態（セーブポイント）として保つため、作業時は必ずトピックブランチを切ってください。

### 5.1. ブランチ命名規則（Issue番号必須）
ワークフロー強制フック（`.agents/scripts/enforce_workflow.mjs`）により、ブランチ名には必ず `issue-<番号>` を含める必要があります（[task-init](.agents/skills/task-init/SKILL.md) スキル参照）：
- **機能追加**: `feature/issue-<番号>-<short-name>`
- **バグ修正**: `fix/issue-<番号>-<short-name>`
- **リファクタリング**: `refactor/issue-<番号>-<short-name>`
- **ドキュメント・設定整備**: `docs/issue-<番号>-<short-name>` または `chore/issue-<番号>-<short-name>`

### 5.2. 標準開発サイクル（Executor / Worker ➔ Reviewer 分離手順）
1. **Issue起票 & ブランチ作成 (Plan / 親エージェント)**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/issue-<番号>-<short-name>
   ```
2. **実装・ローカル検証 (Executor / Worker)**:
   - コードおよびドキュメントを変更し、必ず `make check` を実行して全テスト・ビルドがパスすることを確認します。
   - セッション中に新たな学びやルールの乖離が見つかった場合は、[agents-md-management](.agents/skills/agents-md-management/SKILL.md) スキルを用いて `AGENTS.md` や `.agents/rules/` をメンテナンスします。
3. **コミット & レビュー依頼 (Executor / Worker)**:
   - 日本語 Conventional Commits 形式（`feat: ...`）でコミットします。
   - **実装担当ワーカー自身はマージを行わず**、Plan フェーズ／親エージェント（Reviewer）へ変更サマリー（30行以内）を添えてレビュー依頼を行います。
4. **独立コードレビュー & 実態監査 (Fact Audit) & マージ (Reviewer)**:
   - Reviewer が `git diff main...<branch>` を5大観点（①要件整合性、②純粋関数・責務分離、③セキュリティ/エラー処理、④テスト妥当性、⑤ドキュメント追従）に加え、**報告サマリー・PR本文と実差分（`git diff main...<branch> --name-status`）の突き合わせ監査（Fact Audit: 虚偽報告や漏れの排除）**でレビューし、問題がなければ承認フラグ付きでマージしてプッシュします：
     ```bash
     git switch main
     REVIEW_APPROVED=1 git merge --no-ff <branch>
     git push origin main
     git branch -d <branch>
     ```

### 5.3. One-Pass 実行運用（高効率モード）
Plan フェーズ／親エージェントから明示的に委譲された場合、Executor / Worker（または実行用サブエージェント）は以下の1パス完結フローを実行できます：
1. `main` からトピックブランチを作成し、コードとドキュメントを実装。
2. `make check` を実行し、全検証のパスを確認。
3. 日本語 Conventional Commits 形式でコミット。
4. `git diff main...<branch>` を5大観点で自己レビューし、問題があれば修正。
5. `git switch main && REVIEW_APPROVED=1 git merge --no-ff <branch> && git push origin main && git branch -d <branch>` を実行してマージ＆プッシュ。
6. 親エージェント（またはユーザー）へ25行以内の簡潔な構造化サマリーで完了報告。

---

## 6. MCP (Model Context Protocol) 運用ガイドライン

1. **機密情報を含む設定 (GitHub PATなど)**:
   - **絶対に `.agents/` 内の設定ファイルにハードコードしないでください。**
   - 個人のトークンや認証情報が必要な MCP は、リポジトリ外のグローバル設定 (`~/.gemini/antigravity/mcp/` 等) で管理してください。
2. **共有可能な設定 (ローカル開発DBなど)**:
   - トークン漏洩のリスクがなく、開発チーム全員で共有すべき設定はプロジェクト内に記述してコミットします。
