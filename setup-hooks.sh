#!/usr/bin/env bash
set -euo pipefail

echo "================================================================="
echo "🔒 [AI-Native Guardrails] Git フックと安全装置のセットアップ"
echo "================================================================="

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$ROOT_DIR"

# 1. Git リポジトリ判定
if [ ! -d ".git" ]; then
    echo "❌ .git ディレクトリが見つかりません。Git リポジトリのルートで実行してください。" >&2
    exit 1
fi

# 2. .githooks への実行権限付与
echo "⚙️ 1. .githooks/ 内のスクリプトに実行権限を付与しています..."
if [ -d ".githooks" ]; then
    chmod +x .githooks/*
    echo "  ↳ pre-commit, commit-msg, pre-push に実行権限を付与しました。"
else
    echo "❌ .githooks ディレクトリが見つかりません。" >&2
    exit 1
fi

# 3. core.hooksPath の登録
echo "⚙️ 2. Git のフック参照先 (core.hooksPath) を .githooks に切り替えています..."
git config core.hooksPath .githooks
echo "  ↳ git config core.hooksPath .githooks を設定しました。"

# 4. 古い .husky の無効化・整理確認
if [ -d ".husky" ]; then
    echo "ℹ️ 3. 旧 Husky 設定を検出しました。.githooks が優先されるため影響はありません。"
fi

# 5. フックの動作確認テスト (dry-run)
echo "🔍 4. 設定の反映を確認しています..."
CURRENT_HOOKS_PATH="$(git config --get core.hooksPath || echo '')"
if [ "$CURRENT_HOOKS_PATH" = ".githooks" ]; then
    echo "  ↳ ✅ core.hooksPath = .githooks (正常に反映されています)"
else
    echo "  ↳ ❌ core.hooksPath の設定に失敗しました: '$CURRENT_HOOKS_PATH'" >&2
    exit 1
fi

echo ""
echo "================================================================="
echo "🎉 Git フックの反映が完了しました！"
echo "================================================================="
echo "有効化されたガードレール:"
echo "  • main ブランチ直接コミットの物理禁止"
echo "  • REVIEW_APPROVED=1 なしの自己マージ物理遮断"
echo "  • 日本語文字を含む Conventional Commits の強制"
echo "  • git push 前の make check (脆弱性・型・テスト・ビルド) 自動検証"
echo "================================================================="
