---
title: AIのタスク管理・3軸ルール（優先度・サイズ・依存関係）
description: "AIが次に着手するIssueを選んだり、実装を進める際に読み込まれます"
priority: high
---

# Instructions

このプロジェクトでは、タスク（Issue）を以下の「3軸」で管理しています。
AI（私）が自律的にタスクを消化する際は、このルールに厳格に従ってください。

## 1. 優先度 (Priority)
Issueには `P0: Blocker`, `P1: High`, `P2: Normal`, `P3: Low` のいずれかが設定されます。
- **着手順序**: 作業指示を受けた際、特に指定がなければ `P0` → `P1` → `P2` → `P3` の順で着手すること。

## 2. 依存関係 (Dependencies)
- **子Issue優先**: ブロックされているIssue（サブIssueを持つ親Issueなど）には着手せず、ブロックされていない末端のIssue（子Issue）から消化すること。
- **Issue起票時のルール**: 現在のブランチが `issue-XXX` の場合、ここから新規のIssueを起票する際は、必ず本文に `#XXX`（親Issueへのリンク）を含めて孤立を防ぐこと。

## 3. サイズ (Size) と 分割義務 ★絶対ルール
Issueには `Size: S`, `Size: M`, `Size: L` のいずれかが設定されます。

**🚨【CRITICAL WARNING】🚨**
AIは、`Size: L` が設定されているIssueで**直接コードを書いて実装してはいけません。**

`Size: L`（エピック級タスク）の実装を依頼された場合の正しいワークフロー：
1. `issue-XXX` のブランチを切る。
2. 必要な調査や設計書の作成（`docs/` への Markdown 追加など）のみを行う。
3. 実装作業は行わず、この機能を `Size: S` または `Size: M` に収まる複数の「サブIssue」に分割して `gh issue create` で起票する。
4. サブIssueが起票できたら、現在の Lサイズの作業は完了とし、起票したサブIssue群をユーザーに報告する。

※もし `Size: L` のIssueで直接コード（`src/`, `backend/`, `frontend/` 等）を編集しようとすると、システムフックによって強制的にブロックされます。

> Last Updated: 2026-08-24
