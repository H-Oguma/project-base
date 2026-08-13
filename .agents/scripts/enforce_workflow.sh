#!/bin/bash

# 現在のブランチ名を取得
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

# ブランチが取得できない場合（Gitリポジトリ外など）はスルー
if [ -z "$CURRENT_BRANCH" ]; then
  exit 0
fi

# mainまたはmasterブランチの場合はエラーを返す
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
  echo "🚨 [WORKFLOW ENFORCEMENT ERROR] 🚨"
  echo "現在のブランチは '$CURRENT_BRANCH' です。"
  echo "このプロジェクトでは、main/masterブランチに直接コミット（ファイル編集）することは禁止されています。"
  echo "ファイルの編集を行う前に、必ず以下の手順を行ってください："
  echo "1. 新しいIssueを作成する (gh issue create)"
  echo "2. 作業用の新しいブランチを作成する (git checkout -b feature/...)"
  echo "--------------------------------------------------------"
  echo "※AIエージェントへの指示: 直ちにファイル編集ツールを停止し、ユーザーに報告するか、自律的にブランチを作成してください。"
  
  # エラーコード1で終了し、Antigravityのフック処理を失敗させる
  exit 1
fi

# 問題なければ成功として終了
exit 0
