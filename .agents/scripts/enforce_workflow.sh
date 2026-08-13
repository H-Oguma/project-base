#!/bin/bash

# ============================================================================
# ワークフロー強制ガードスクリプト
# main/masterブランチ上でのファイル編集・コマンド実行をブロックする。
# ただし、ワークフローの遂行に必要なコマンド（Issue作成・ブランチ作成等）は許可する。
#
# Antigravity 2.0 の PreToolUse フックとして動作:
# - stdin: ツール呼び出しのコンテキスト (JSON)
# - stdout: 判定結果 (JSON: {"decision": "allow"} or {"decision": "deny", "reason": "..."})
# ============================================================================

# stdinからJSON入力を読み取る
INPUT=$(cat)

# 現在のブランチ名を取得
# CWDはhooks.jsonのあるディレクトリ（.agents/）なので、親ディレクトリのgitを参照
CURRENT_BRANCH=$(git -C .. rev-parse --abbrev-ref HEAD 2>/dev/null)

# ブランチが取得できない場合（Gitリポジトリ外など）は許可
if [ -z "$CURRENT_BRANCH" ]; then
  echo '{"decision": "allow"}'
  exit 0
fi

# mainまたはmasterブランチ以外なら常に許可
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
  echo '{"decision": "allow"}'
  exit 0
fi

# ============================================================================
# 以降、main/masterブランチ上での判定
# ============================================================================

# ツール名を取得（JSON入力から）
TOOL_NAME=$(echo "$INPUT" | grep -o '"toolName"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"toolName"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# ファイル編集系ツールは常にブロック
case "$TOOL_NAME" in
  write_to_file|replace_file_content|multi_replace_file_content)
    echo "[WORKFLOW GUARD] ブランチ '$CURRENT_BRANCH' でのファイル編集をブロックしました" >&2
    cat <<'EOF'
{"decision": "deny", "reason": "🚨 [ワークフロー違反] 現在のブランチは main/master です。直接のファイル編集は禁止されています。\n\n以下の手順を実行してください:\n1. GitHub Issue を作成する (gh issue create)\n2. 作業用ブランチを作成する (git checkout -b issue-<番号>-<説明>)\n\n※ task-init スキル（/start コマンド）で自動化できます。"}
EOF
    exit 0
    ;;
esac

# run_command の場合はコマンド内容をチェック
if [ "$TOOL_NAME" = "run_command" ]; then
  # コマンドラインを取得
  COMMAND_LINE=$(echo "$INPUT" | grep -o '"CommandLine"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"CommandLine"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

  # mainブランチでも許可するコマンドのホワイトリスト
  ALLOWED=false

  # --- Git ワークフロー系コマンド ---
  # ブランチ作成・切り替え
  echo "$COMMAND_LINE" | grep -qE '^\s*git\s+(checkout\s+-b|switch\s+-c|branch\s)' && ALLOWED=true
  # git pull / fetch（最新取得）
  echo "$COMMAND_LINE" | grep -qE '^\s*git\s+(pull|fetch)\b' && ALLOWED=true
  # git status / log / branch / diff（読み取り系）
  echo "$COMMAND_LINE" | grep -qE '^\s*git\s+(status|log|branch|diff|show|rev-parse|remote)\b' && ALLOWED=true

  # --- GitHub CLI 系コマンド ---
  # Issue 作成・閲覧
  echo "$COMMAND_LINE" | grep -qE '^\s*gh\s+issue\s+(create|list|view|edit)\b' && ALLOWED=true
  # PR 閲覧（PR作成はブランチ上で行うべきなので許可しない）
  echo "$COMMAND_LINE" | grep -qE '^\s*gh\s+pr\s+(list|view|status)\b' && ALLOWED=true
  # リポジトリ情報の確認
  echo "$COMMAND_LINE" | grep -qE '^\s*gh\s+repo\s+view\b' && ALLOWED=true

  if [ "$ALLOWED" = true ]; then
    echo '{"decision": "allow"}'
    exit 0
  fi

  # ホワイトリスト外のコマンドはブロック
  echo "[WORKFLOW GUARD] ブランチ '$CURRENT_BRANCH' でのコマンド実行をブロックしました: $COMMAND_LINE" >&2
  cat <<'EOF'
{"decision": "deny", "reason": "🚨 [ワークフロー違反] 現在のブランチは main/master です。直接のコマンド実行は禁止されています。\n\n以下の手順を実行してください:\n1. GitHub Issue を作成する (gh issue create)\n2. 作業用ブランチを作成する (git checkout -b issue-<番号>-<説明>)\n\n※ task-init スキル（/start コマンド）で自動化できます。"}
EOF
  exit 0
fi

# その他のツール（想定外）は許可
echo '{"decision": "allow"}'
exit 0
