# 開発・貢献ガイド (Contributing Guide)

本リポジトリ（`project-base`）への開発参加・貢献に関するガイドラインです。
本プロジェクトでは、人間とAIアシスタントが円滑に協働できるように、明確な開発フローと規約を定めています。

---

## 目次
1. [前提環境 (Prerequisites)](#1-前提環境-prerequisites)
2. [開発環境のセットアップ手順](#2-開発環境のセットアップ手順)
3. [ブランチ運用と開発フロー](#3-ブランチ運用と開発フロー)
4. [コミットメッセージ規約](#4-コミットメッセージ規約)
5. [テスト・Lint の実行方法](#5-テストlint-の実行方法)
6. [Pull Request (PR) 作成・レビューフロー](#6-pull-request-pr-作成レビューフロー)

---

## 1. 前提環境 (Prerequisites)

ローカル環境で開発を行うには、以下のツールが必要です。

| ツール | 推奨バージョン | 用途 |
|---|---|---|
| **Node.js** | `v20.x` 以上 | フロントエンドビルド、タスクランナー、Git Hooks |
| **npm** | `v10.x` 以上 | Node.js パッケージ管理 |
| **Python** | `v3.12` 以上 | バックエンド（FastAPI）実行環境 |
| **uv** | 最新版 | 高速な Python パッケージ・仮想環境マネージャー |
| **GitHub CLI** | 最新版 | Issue / PR の作成・操作 |
| **Git** | `v2.30` 以上 | バージョン管理 |

---

## 2. 開発環境のセットアップ手順

### クイックセットアップ（推奨）
リポジトリをクローンした後、プロジェクトルートでセットアップスクリプトを実行します。

```bash
# 依存関係のインストールとGit Hooksの初期設定
npm run setup
```

### 手動セットアップ
個別に行う場合は以下の手順で実施します。

```bash
# 1. ルートの依存関係（Husky, Commitlint等）インストール
npm install

# 2. バックエンドの依存関係インストール
cd backend && uv sync && cd ..

# 3. フロントエンドの依存関係インストール
cd frontend && npm install && cd ..

# 4. Git Hooks の有効化
npm run prepare
```

### 開発サーバーの起動
```bash
# フロントエンド (localhost:5173) とバックエンド (localhost:8000) を同時起動
npm run dev
```

---

## 3. ブランチ運用と開発フロー

本プロジェクトは **GitHub Flow** および **Issue/PR 駆動開発** をベースにしています。

### 基本ルール
- **ベースブランチ**: 常に最新の `main`
- **ブランチ命名規則**: `<prefix>/issue-<Issue番号>-<short-name>`

### ブランチ prefix 一覧
| prefix | 用途 | 例 |
|---|---|---|
| `feature/` | 新機能の追加 | `feature/issue-10-user-auth` |
| `fix/` | バグ修正 | `fix/issue-25-login-validation` |
| `refactor/` | リファクタリング（挙動変更なし） | `refactor/issue-30-db-queries` |
| `docs/` | ドキュメントのみの追加・修正 | `docs/issue-107-contributing-guide` |
| `chore/` | ビルド設定、CI、依存関係の更新など | `chore/issue-50-update-deps` |

### 開発の手順
1. **Issue の確認・起票**: 作業前に対応する Issue が存在することを確認（なければ起票）。
2. **ブランチの作成**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b <prefix>/issue-<番号>-<short-name>
   ```
3. **実装とテスト (TDD)**:
   - テストを先行・並行して記述し、実装を進める。
   - コメント・docstring・ドキュメントは日本語で記述する。
4. **テスト・Lint のパス確認**:
   ```bash
   npm run test
   npm run lint
   ```
5. **コミット & プッシュ**:
   ```bash
   git add .
   git commit -m "<type>(<scope>): <要約> (#<Issue番号>)"
   git push -u origin <branch-name>
   ```

---

## 4. コミットメッセージ規約

本プロジェクトでは **Conventional Commits** に準拠し、コミットメッセージの末尾に関連する Issue 番号を記載します（Husky + Commitlint により自動検証されます）。

### フォーマット
```text
<type>(<scope>): <要約> (#<Issue番号>)
```

### 各フィールドの説明
- **type**: 変更の性質（半角英小文字）
  - `feat`: 新機能
  - `fix`: バグ修正
  - `refactor`: リファクタリング
  - `docs`: ドキュメント修正
  - `test`: テストの追加・修正
  - `chore`: ビルド設定・依存関係・その他
  - `style`: コードのフォーマット（挙動に影響しない変更）
  - `perf`: パフォーマンス改善
  - `ci`: CI/CD ワークフローの変更
- **scope**: 変更の影響範囲（省略可能ですが指定を推奨）
  - `frontend`, `backend`, `infra`, `docs`, `config`, `deps` など
- **要約**: 変更内容を日本語で簡潔に記述
- **Issue 番号**: `(#番号)` の形式で付与

### コミット例
```bash
feat(backend): ユーザー一覧取得APIにページネーションを追加 (#42)
fix(frontend): ログインフォームのバリデーションエラー表示を修正 (#58)
docs(setup): 環境構築手順にuvのインストール要件を追記 (#71)
refactor(frontend): コンポーネント分割とCSS Modules化 (#102)
```

---

## 5. テスト・Lint の実行方法

プロジェクトルートの `package.json` にタスクランナーが集約されています。
テストおよび Lint は必ずプロジェクトルートから実行してください。

### コマンド一覧
| コマンド | 説明 | 内部動作 |
|---|---|---|
| `npm run test` | 全体テスト実行 | バックエンド（pytest） + フロントエンド（vitest） |
| `npm run test:backend` | バックエンドテスト | `cd backend && uv run pytest --cov=.` |
| `npm run test:frontend` | フロントエンドテスト | `cd frontend && npm run test` (vitest) |
| `npm run lint` | 全体Lintチェック | バックエンド（Ruff） + フロントエンド（oxlint） |
| `npm run lint:backend` | バックエンドLint | `cd backend && uv run ruff check .` |
| `npm run lint:frontend` | フロントエンドLint | `cd frontend && npm run lint` (oxlint) |

### 品質要件
- **TDD (テスト駆動開発)**: 機能追加・バグ修正時には必ず対応するユニットテストを追加してください。
- **Lint エラー 0 件**: Lint による警告・エラーが残っている状態での PR 作成は避けてください。

---

## 6. Pull Request (PR) 作成・レビューフロー

### PR 作成手順
1. **テンプレートの遵守**:
   - `.github/PULL_REQUEST_TEMPLATE.md` に沿ってすべての項目を記載します。
   - `Closes #<Issue番号>` を必ず含め、マージ時に Issue が自動クローズされるようにします。
   - テスト実行ログ（`npm run test` の出力）を `<details>` ブロックに貼り付けます。
2. **PR タイトル規約**:
   ```text
   [<種別>] <要約>
   ```
   例: `[Feature] ユーザー認証APIの追加`, `[Bugfix] ログインバリデーションの修正`, `[Docs] CONTRIBUTING.md の作成`
3. **PR 起票**:
   - GitHub Web UI または GitHub CLI からテンプレートに沿った本文を指定して起票します。

### CI による自動チェック
PR が作成されると、GitHub Actions により以下が自動実行されます:
- バックエンドのテスト・カバレッジ計測・Lint
- フロントエンドのテスト・Lint・ビルド検証
- コミットメッセージおよびPRフォーマットのバリデーション

すべてのチェックがパスしたことを確認した上で、レビュアーへのレビュー依頼を行ってください。
