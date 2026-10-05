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

### サブIssueの紐付け ★絶対ルール
本文に「親Issue: #N」と書くだけでは、GitHub の **Sub-issue（親子関係メタデータ）** として紐付かず、Projectボード上で親子関係が表示されません。
サブIssueを起票する際は、以下を必ず守ること。

1. **`gh issue create --parent <親Issue番号>` で起票する**（本文にも「親Issue: #N」を記載する）。
   ```bash
   gh issue create --parent 123 \
     --title "[Task]: 〇〇の実装" \
     --body "## 概要\n...\n\n親Issue: #123" \
     --label "enhancement,P2: Normal,Size: S"
   ```
2. **MCP の `create_issue` でサブIssueを起票しない**（Sub-issue の親子付けができないため）。
3. 既に起票済みのIssueを後から紐付ける場合は、以下のいずれかを使用する。
   ```bash
   gh issue edit <子Issue番号> --parent <親Issue番号>
   gh issue edit <親Issue番号> --add-sub-issue <子Issue番号>,<子Issue番号>
   ```
4. 起票後、以下のコマンドで Sub-issue として紐付いたことを確認してからユーザーに報告する。
   ```bash
   gh issue view <子Issue番号> --json parent      # parent が null でないこと
   gh issue view <親Issue番号> --json subIssues   # 子Issueが一覧に含まれること
   ```

※ 本文に「親Issue: #N」があるのに `--parent` が無い `gh issue create` や、親Issue記載のある MCP `create_issue` はシステムフックでブロックされます。
※ セーフティネットとして、GitHub Actions (`.github/workflows/link-sub-issue.yml`) が本文の「親Issue: #N」（Issueフォームの「親Issue」欄を含む）を検出して自動で紐付けますが、AIはこれに頼らず必ず自分で `--parent` を指定すること。

## 3. サイズ (Size) と 分割義務 ★絶対ルール
Issueには `Size: S`, `Size: M`, `Size: L` のいずれかが設定されます。

**🚨【CRITICAL WARNING】🚨**
AIは、`Size: L` が設定されているIssueで**直接コードを書いて実装してはいけません。**

`Size: L`（エピック級タスク）の実装を依頼された場合の正しいワークフロー：
1. `issue-XXX` のブランチを切る。
2. 必要な調査や設計書の作成（`docs/` への Markdown 追加など）のみを行う。
3. 実装作業は行わず、この機能を `Size: S` または `Size: M` に収まる複数の「サブIssue」に分割して `gh issue create --parent XXX` で起票する（上記「サブIssueの紐付け」ルールに従うこと）。
4. サブIssueが起票できたら、現在の Lサイズの作業は完了とし、起票したサブIssue群をユーザーに報告する。

※もし `Size: L` のIssueで直接コード（`src/`, `backend/`, `frontend/` 等）を編集しようとすると、システムフックによって強制的にブロックされます。

> Last Updated: 2026-10-06
