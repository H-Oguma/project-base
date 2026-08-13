# AI-Driven Development Base Project

このリポジトリは、**AI駆動開発（AI-Driven Development）**をスムーズに行うためのベースプロジェクト（テンプレート）です。
Cursor、Windsurf、GitHub Copilot、Cline などのAIアシスタントと協働することを前提とした設定が組み込まれています。

## 🌟 特徴

- **AIコンテキスト (`AI_CONTEXT.md`)**: AIがプロジェクトの全体像を即座に把握するためのメタドキュメント。
- **グローバルルール (`.cursorrules`)**: AIエージェントに一貫した振る舞い（テスト駆動、日本語回答など）を強制。
- **CI/CDパイプライン**: 自動テスト・自動Lintの整備により、AIが生成したコードの品質を担保。
- **統一されたタスクランナー (`Makefile`)**: AIが迷わずテストやLintを実行できるエントリーポイント。

## 🚀 使い方

このリポジトリをテンプレートとして使用し、新しいプロジェクトを開始してください。

```bash
# 1. テンプレートからリポジトリを作成・クローン後、ディレクトリに移動
cd your-new-project

# 2. 依存関係のインストール（必要に応じて）
cd backend && pip install -r requirements.txt
cd ../frontend && npm install
cd ..

# 3. テストとLintの実行確認
make test-all
make lint
```

## 🤖 AIエージェントへの指示方法

AIアシスタントに作業を依頼する際は、以下の点に留意してください。

- **「まずは `AI_CONTEXT.md` を読んでください」** と指示すると、AIがプロジェクト構造を素早く理解します。
- テストを実行させたい場合は **「`make test-all` で確認して」** と指示してください。

## ⚠️ License

MIT License (適宜変更してください)
