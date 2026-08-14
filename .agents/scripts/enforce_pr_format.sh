#!/bin/bash

# ============================================================================
# PR作成時フォーマットチェックガード
# `gh pr create` 実行時に、--body または --body-file 引数の内容をチェックし
# PRテンプレートに沿っているか（必須セクションが存在するか）を検証する。
# ============================================================================

INPUT=$(cat)

# --- JSONパース用ヘルパー ---
get_tool_name() {
  local json="$1"
  if command -v jq &>/dev/null; then
    echo "$json" | jq -r '.toolCall.name // empty' 2>/dev/null
  else
    echo "$json" | grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/'
  fi
}

get_command_line() {
  local json="$1"
  if command -v jq &>/dev/null; then
    echo "$json" | jq -r '.toolCall.args.CommandLine // empty' 2>/dev/null
  else
    echo "$json" | grep -o '"CommandLine"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"CommandLine"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/'
  fi
}

TOOL_NAME=$(get_tool_name "$INPUT")

if [ "$TOOL_NAME" != "run_command" ]; then
  echo '{"decision": "allow"}'
  exit 0
fi

COMMAND_LINE=$(get_command_line "$INPUT")

# "gh pr create" コマンドでない場合は許可
if ! echo "$COMMAND_LINE" | grep -qE '^\s*gh\s+pr\s+create\b'; then
  echo '{"decision": "allow"}'
  exit 0
fi

# gh pr create コマンドの場合、--body または --body-file が使われているかチェック
BODY_CONTENT=""

if echo "$COMMAND_LINE" | grep -q -- "--body-file"; then
  # --body-file <filename> を抽出
  FILE_NAME=$(echo "$COMMAND_LINE" | grep -o -- '--body-file[ =][^ ]*' | sed 's/--body-file[ =]//' | tr -d "'\"")
  if [ -f "$FILE_NAME" ]; then
    BODY_CONTENT=$(cat "$FILE_NAME")
  else
    echo "[PR GUARD] 指定されたbody-fileが見つかりません: $FILE_NAME" >&2
    cat <<'EOF'
{"decision": "deny", "reason": "🚨 [PRフォーマット違反] --body-file で指定されたファイルが見つかりません。"}
EOF
    exit 0
  fi
elif echo "$COMMAND_LINE" | grep -q -- "--body"; then
  # --body "..." を抽出（簡易的な実装だが、AIがよくやる短い文字列を弾ければよい）
  BODY_CONTENT=$(echo "$COMMAND_LINE" | grep -o -- '--body[ =].*')
else
  # どちらも指定されていない場合はインタラクティブモードになるかエラーになるので弾く
  echo "[PR GUARD] --body または --body-file が指定されていません" >&2
  cat <<'EOF'
{"decision": "deny", "reason": "🚨 [PRフォーマット違反] PR本文(--body または --body-file)が指定されていません。\n\n/pr コマンド（create-prスキル）を使用してテンプレート通りにPRを作成してください。"}
EOF
  exit 0
fi

# 必須キーワード（テンプレートのセクション）のチェック
# テンプレートに含まれる "変更種別", "影響範囲", "関連Issue", "何を変更したか" などが含まれているか
MISSING_SECTIONS=""

echo "$BODY_CONTENT" | grep -q "変更種別" || MISSING_SECTIONS="$MISSING_SECTIONS [変更種別]"
echo "$BODY_CONTENT" | grep -q "影響範囲" || MISSING_SECTIONS="$MISSING_SECTIONS [影響範囲]"
echo "$BODY_CONTENT" | grep -q "関連Issue" || MISSING_SECTIONS="$MISSING_SECTIONS [関連Issue]"
echo "$BODY_CONTENT" | grep -q "何を変更したか" || MISSING_SECTIONS="$MISSING_SECTIONS [何を変更したか]"

if [ -n "$MISSING_SECTIONS" ]; then
  echo "[PR GUARD] PR本文に必須セクションが不足しています: $MISSING_SECTIONS" >&2
  cat <<EOF
{"decision": "deny", "reason": "🚨 [PRフォーマット違反] PR本文に以下の必須セクションが含まれていません:\n$MISSING_SECTIONS\n\n必ず create-pr スキル（/pr コマンド）を使用し、.github/PULL_REQUEST_TEMPLATE.md に沿って本文を作成してください。"}
EOF
  exit 0
fi

# すべてチェックを通過した場合は許可
echo '{"decision": "allow"}'
exit 0
