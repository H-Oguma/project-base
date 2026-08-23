# project-base 開発フロー規約

このファイルは、本プロジェクトにおける日々の開発フロー（ブランチ運用、PR・Issueの扱い、各種コマンド）の規約を定めたものです。

## A. ブランチ命名とベース
- **ベースブランチ**: `main`
- **ブランチ名フォーマット**: `<prefix>/issue-<Issue番号>-<short-name>`
- **prefix の種類**:
  - `feature/` : 新機能追加
  - `fix/` : バグ修正
  - `docs/` : ドキュメントのみの変更
  - `refactor/` : リファクタリング（機能変更なし）
  - `chore/` : ビルド・CI・依存関係などの雑務

## B. PR (Pull Request)
- base は必ず `main` を明示する。
- 既定で `--draft` として作成し、レビューエージェントの完了を待つ。
- 本文は用意されているテンプレート（`.github/PULL_REQUEST_TEMPLATE.md`）に厳密に従って記述する。
- 調査ログや検証データなどの長い情報は本文ではなく、PR コメントへ記述する。

## C. Issue
- 作業開始前に必ず `gh issue list` 等で重複がないか確認する。
- 親タスクの完了条件に含まれない不具合を新たに見つけた場合は、sub-issue ではなく独立した Issue として起票する。

## D. コミット / タイトル様式
- Conventional Commits + scope の形式に従う。
- コミットの末尾に Issue 番号を付ける。本文は日本語。
- フォーマット: `<type>(<scope>): <要約> (#<番号>)`

## E. lint / test コマンド
プロジェクトルートにある `package.json` を通じて実行すること。
- lint: `npm run lint` （チェックのみ。formatは行わない）
- test: `npm run test`
