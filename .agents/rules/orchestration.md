---
title: Task Orchestration and Cost Optimization
activation: always_on
priority: high
---

# Agent Orchestration Guidelines

本プロジェクトではコスト最適化と効率的なリソース管理を厳守する。
サブエージェントの呼び出し・管理は以下のルールに従うこと。

## 1. タスク種別ごとのサブエージェント選択

タスクの内容に応じて、以下の表に基づき最適なサブエージェントを選択すること。

| タスク種別 | 呼び出すサブエージェント | モデル |
|:--|:--|:--|
| コード調査・影響範囲分析 | `researcher` | `flash` |
| Web検索・技術調査 | `researcher` | `flash` |
| 機能実装・コード編集 | `worker` | `inherit` |
| テストコード作成 | `worker` | `inherit` |
| テスト実行・結果分析 | `tester` | `flash` |
| コードレビュー（PR前必須） | `reviewer` | `flash` |
| 設計相談・技術選定 | `planner` | `inherit` |
| タスク分解・計画立案 | `planner` | `inherit` |

## 2. サブエージェントのモデル選択

- `flash` で済むタスクに `inherit` や `pro` を使わないこと。
- `pro` モデルは**ユーザーが明示的に指示した場合のみ**使用可。
- 迷ったら `flash` を試し、品質が不十分な場合のみ `inherit` にエスカレーションする。
- ※ ただし `worker` と `planner` は標準で `inherit` 推奨。上記エスカレーションルールは `researcher` / `tester` / `reviewer` に適用。

## 3. サブエージェントの再利用

- 新しいサブエージェントを起動する前に、`manage_subagents` (list) で既存の idle サブエージェントを確認する。
- 同じ種別の idle サブエージェントがあれば `send_message` で再利用する。
- 種別が異なる場合は新規起動する（researcher に worker の仕事をさせない）。

## 4. リソース解放

- サブエージェントの目的が達成されたら、速やかに `manage_subagents` (kill) で終了させる。
- バックグラウンドタスクも同様に `manage_task` (kill) で解放する。

## 5. ワークスペース管理

- サブエージェント起動時は原則 `Workspace: 'inherit'` を使用する。
- 破壊的テストが必要な場合のみ `'branch'` を使用する。
- 不要なワークスペース分岐は行わない。

## 6. 標準的な開発フロー

一般的な開発タスクでは、以下の順序でサブエージェントを活用する：

```
1. （親エージェント）    → Issue起票 & ブランチ作成（workflow.md準拠・必須）
2. researcher (flash)  → 事前調査・影響範囲の確認
3. planner (inherit)   → 設計方針の立案（必要な場合のみ）
4. worker (inherit)    → 実装・テスト作成
5. tester (flash)      → テスト実行・結果確認（失敗時は 4 へ戻る）
6. reviewer (flash)    → コードレビュー（Critical/Warning指摘ありの場合は 4 へ戻る）
7. （親エージェント）    → PR作成
```

> 注意: 全ステップが必要なわけではない。単純なバグ修正なら 1 → 4 → 5 → 6 → 7 で十分。
> ただし、ステップ1（Issue起票 & ブランチ作成）は**省略不可**。
