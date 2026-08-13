#!/bin/bash

# ============================================================================
# ワークフロー強制ガードスクリプト
# main/masterブランチ上でのファイル編集・コマンド実行をブロックする。
#
# Antigravity 2.0 の PreToolUse フックとして動作:
# - stdin: ツール呼び出しのコンテキスト (JSON)
# - stdout: 判定結果 (JSON: {"decision": "allow"} or {"decision": "deny", "reason": "..."})
# ============================================================================

# stdinからJSON入力を読み取る（将来の拡張に備えて）
INPUT=$(cat)

# 現在のブランチ名を取得
# CWDはhooks.jsonのあるディレクトリ（.agents/）なので、親ディレクトリのgitを参照
CURRENT_BRANCH=$(git -C .. rev-parse --abbrev-ref HEAD 2>/dev/null)

# ブランチが取得できない場合（Gitリポジトリ外など）は許可
if [ -z "$CURRENT_BRANCH" ]; then
  echo '{"decision": "allow"}'
  exit 0
fi

# mainまたはmasterブランチの場合はブロック
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
  # デバッグ情報はstderrに出力
  echo "[WORKFLOW GUARD] ブランチ '$CURRENT_BRANCH' での操作をブロックしました" >&2

  # stdoutにJSON形式でdeny判定を返す
  cat <<'EOF'
{"decision": "deny", "reason": "🚨 [ワークフロー違反] 現在のブランチは main/master です。直接のファイル編集・コマンド実行は禁止されています。\n\n以下の手順を実行してください:\n1. GitHub Issue を作成する (gh issue create)\n2. 作業用ブランチを作成する (git checkout -b issue-<番号>-<説明>)\n\n※ task-init スキル（/start コマンド）で自動化できます。"}
EOF
  exit 0
fi

# 問題なければ許可
echo '{"decision": "allow"}'
exit 0
