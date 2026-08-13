#!/usr/bin/env bash

set -e

echo "🚀 新規プロジェクトのセットアップを開始します..."

# 1. プロジェクト名の入力
read -p "プロジェクト名を入力してください (例: my-awesome-app): " PROJECT_NAME
if [ -z "$PROJECT_NAME" ]; then
    echo "エラー: プロジェクト名が入力されていません。"
    exit 1
fi

# 2. READMEの置換
echo "📝 README.md のプロジェクト名を更新中..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # Mac (BSD sed)
  sed -i '' "s/AI-Driven Development Base Project/$PROJECT_NAME/g" README.md
else
  # Linux (GNU sed)
  sed -i "s/AI-Driven Development Base Project/$PROJECT_NAME/g" README.md
fi

# 3. 依存関係のインストール
echo "📦 依存パッケージのインストールを行います..."
echo "--> Backend (Python)"
if [ -d "backend" ]; then
  cd backend
  python3 -m venv venv
  source venv/bin/activate
  if [ -f "requirements.txt" ]; then
      pip install -r requirements.txt
  fi
  deactivate
  cd ..
fi

echo "--> Frontend (Node.js)"
if [ -d "frontend" ]; then
  cd frontend
  npm install
  cd ..
fi

# 4. .gitの再初期化
echo "🗑️  既存のGit履歴を削除し、新規リポジトリとして再初期化します..."
rm -rf .git
git init
git add .
git commit -m "feat: initial commit for $PROJECT_NAME"

echo "✅ セットアップが完了しました！"
echo "--------------------------------------------------"
echo "🔥 次のステップ:"
echo "1. テストの実行:"
echo "   make test-all"
echo ""
echo "2. GitHubリポジトリを作成し、Pushしてください:"
echo "   gh repo create $PROJECT_NAME --public --source=. --remote=origin --push"
echo ""
echo "3. AIに最初のタスクを依頼して開発を始めましょう:"
echo "   「/start [実装したい機能やタスク]」 と指示すると、"
echo "   自動でIssueが起票され、作業用ブランチが作成されます！"
echo "--------------------------------------------------"
