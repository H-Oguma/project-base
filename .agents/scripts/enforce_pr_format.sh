#!/bin/bash

# ============================================================================
# PR作成時フォーマットチェックガード
# `gh pr create` 実行時に、--body または --body-file 引数の内容をチェックし
# PRテンプレートに沿っているか（必須セクションが存在するか）を検証する。
# ============================================================================

INPUT=$(cat)

python3 -c '
import sys, json, re

try:
    input_data = sys.argv[1]
    if not input_data.strip():
        print(json.dumps({"decision": "allow"}))
        sys.exit(0)

    data = json.loads(input_data)
    tool_name = data.get("toolCall", {}).get("name", "")
    
    if tool_name != "run_command":
        print(json.dumps({"decision": "allow"}))
        sys.exit(0)
        
    command_line = data.get("toolCall", {}).get("args", {}).get("CommandLine", "").strip()
    
    # gh pr create コマンドの検知 (先頭または空白区切りでの出現)
    if re.search(r"(^|\s)gh\s+pr\s+create\b", command_line):
        print(json.dumps({
            "decision": "deny", 
            "reason": "🚨 [PR直接作成禁止] gh pr create コマンドの直接実行は禁止されています。\n\n必ず create-pr スキル（/pr コマンド）を使用してPRを作成してください。"
        }))
        sys.exit(0)

    print(json.dumps({"decision": "allow"}))
except Exception as e:
    # 予期せぬエラーで他のコマンドまでブロックしないよう allow とする
    print(json.dumps({"decision": "allow"}))
' "$INPUT"
