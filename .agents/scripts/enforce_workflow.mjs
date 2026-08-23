import fs from 'fs';
import { execSync } from 'child_process';

try {
  const input = fs.readFileSync(0, 'utf-8');
  if (!input.trim()) {
    console.log(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }
  
  const data = JSON.parse(input);
  const toolName = data.toolCall?.name;
  
  if (!toolName) {
    console.log(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }

  // --- TDD & Docs ガードレール (PR作成時) ---
  if (toolName === 'call_mcp_tool' && data.toolCall?.args?.ToolName === 'create_pull_request') {
    try {
      const diff = execSync('git diff main --name-only', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
      
      const hasCodeChanges = /(src\/|backend\/|frontend\/)/.test(diff) && !/(docs\/|README)/.test(diff);
      const hasTestChanges = /(test|spec)/i.test(diff);
      const hasDocsChanges = /(docs\/|README)/.test(diff);
      
      // プロダクトコードが変更されているのに、テストもドキュメントも変更されていない場合
      if (hasCodeChanges && !hasTestChanges && !hasDocsChanges) {
        console.log(JSON.stringify({
          decision: 'deny',
          reason: '🚨 [品質ガードレール] プロダクトコードが変更されていますが、テストコードとドキュメントの更新が含まれていません。\nTDD（テスト駆動開発）およびドキュメント更新のルールに違反していませんか？\n本当に不要な場合は、PR本文に不要な理由を明記するか、ダミーのコミット等で回避してください。'
        }));
        process.exit(0);
      }
    } catch (e) {
      // ignore git errors
    }
  }

  // --- 子Issueの親Issue紐付けガードレール (Issue作成時) ---
  if (toolName === 'call_mcp_tool' && data.toolCall?.args?.ToolName === 'create_issue') {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      const branchIssueMatch = branch.match(/issue-(\d+)/i);
      
      if (branchIssueMatch) {
        const parentIssueNumber = branchIssueMatch[1];
        const issueBody = data.toolCall?.args?.body || '';
        
        // 本文に親Issue番号が含まれているかチェック
        const regex = new RegExp(`#${parentIssueNumber}\\b`);
        if (!regex.test(issueBody)) {
          console.log(JSON.stringify({
            decision: 'deny',
            reason: `🚨 [トレーサビリティ違反] 現在のブランチ (issue-${parentIssueNumber}) からサブIssueを作成しようとしていますが、本文に親Issue番号 (#${parentIssueNumber}) へのリンクが含まれていません。\n孤立したIssue (Orphan Issue) の発生を防ぐため、本文に「親Issue: #${parentIssueNumber}」のように必ずリンクを記載してください。`
          }));
          process.exit(0);
        }
      }
    } catch (e) {
      // ignore git errors
    }
  }
  // ------------------------------------------

  // --- 環境保護ガードレール (全ブランチ共通) ---
  if (toolName === 'run_command') {
    const commandLine = data.toolCall?.args?.CommandLine || '';
    
    if (/(^|\s)pip\s+(install|uninstall|freeze|list)\b/.test(commandLine)) {
      console.log(JSON.stringify({
        decision: 'deny',
        reason: '🚨 [環境保護] pip コマンドの直接実行はグローバル環境を汚染する恐れがあるため禁止されています。\nパッケージの追加・削除には必ず `uv add <package>` や `uv remove <package>` などの `uv` コマンドを使用してください。'
      }));
      process.exit(0);
    }
    
    if (/(^|&&|\|\||;|\s)python(3)?\s/.test(commandLine) && !commandLine.includes('uv run')) {
      console.log(JSON.stringify({
        decision: 'deny',
        reason: '🚨 [環境保護] python コマンドの直接実行は仮想環境外での誤実行を防ぐため禁止されています。\nスクリプトを実行する場合は必ず `uv run python <script>` や `uv run <command>` の形式を使用してください。'
      }));
      process.exit(0);
    }

    if (/(^|\s)npm\s+(i|install)\s+-g\b/.test(commandLine) || /(^|\s)yarn\s+global\s+add\b/.test(commandLine)) {
      console.log(JSON.stringify({
        decision: 'deny',
        reason: '🚨 [環境保護] npm パッケージのグローバルインストール (-g) は環境汚染を防ぐため禁止されています。\nローカルプロジェクト内にインストールしてください。'
      }));
      process.exit(0);
    }
  }
  // ------------------------------------------

  let branch = '';
  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    // Not in a git repo or error
    console.log(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }
  
  if (branch !== 'main' && branch !== 'master') {
    // ブランチ名に issue-番号 が含まれていない場合は作業をブロック
    if (!/issue-\d+/.test(branch)) {
      if (['write_to_file', 'replace_file_content', 'multi_replace_file_content'].includes(toolName)) {
        console.log(JSON.stringify({
          decision: 'deny',
          reason: '🚨 [トレーサビリティ違反] 現在のブランチ名（' + branch + '）に Issue 番号が含まれていません。\nプロジェクトのルールにより、ファイル編集前に必ず `issue-<番号>` を含むブランチ名に変更してください（例: `git branch -m feature/issue-123-xxx`）。'
        }));
        process.exit(0);
      }
      
      if (toolName === 'run_command') {
        const commandLine = data.toolCall?.args?.CommandLine || '';
        // git branch -m などのリネーム操作や、ブランチ移動操作は許可する
        if (!/^\s*git\s+(branch|checkout|switch|status|log)/.test(commandLine)) {
          console.log(JSON.stringify({
            decision: 'deny',
            reason: '🚨 [トレーサビリティ違反] 現在のブランチ名（' + branch + '）に Issue 番号が含まれていません。\nプロジェクトのルールにより、ブランチ名に `issue-<番号>` が含まれていない状態での作業コマンド実行はブロックされます。'
          }));
          process.exit(0);
        }
      }
    }

    console.log(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }
  
  if (['write_to_file', 'replace_file_content', 'multi_replace_file_content'].includes(toolName)) {
    console.error(`[WORKFLOW GUARD] ブランチ '${branch}' でのファイル編集をブロックしました`);
    console.log(JSON.stringify({
      decision: 'deny',
      reason: '🚨 [ワークフロー違反] 現在のブランチは main/master です。直接のファイル編集は禁止されています。\n\n以下の手順を実行してください:\n1. GitHub Issue を作成する (gh issue create)\n2. 作業用ブランチを作成する (git checkout -b issue-<番号>-<説明>)\n\n※ task-init スキル（/start コマンド）で自動化できます。'
    }));
    process.exit(0);
  }
  
  if (toolName === 'run_command') {
    const commandLine = data.toolCall?.args?.CommandLine || '';
    
    // Check for command chains
    if (/[;|`]|&&|\$\(/.test(commandLine)) {
      console.error(`[WORKFLOW GUARD] コマンドチェーンを検出してブロックしました: ${commandLine}`);
      console.log(JSON.stringify({
        decision: 'deny',
        reason: '🚨 [ワークフロー違反] 現在のブランチは main/master です。複合コマンド（;, |, &&, || 等を含む）の実行は禁止されています。\n\n単一コマンドで実行してください。'
      }));
      process.exit(0);
    }
    
    let allowed = false;
    
    // Allowed Git workflow commands
    if (/^\s*git\s+(checkout\s+-b|switch\s+-c|branch\s)/.test(commandLine)) {
      // ブランチ名に issue-番号 が含まれているかチェック
      if (!/issue-\d+/.test(commandLine)) {
        console.log(JSON.stringify({
          decision: 'deny',
          reason: '🚨 [トレーサビリティ違反] 新規ブランチ名には必ず Issue 番号を含める必要があります（例: `git checkout -b feature/issue-123-xxx`）。\n先に `gh issue create` で Issue を起票し、発行された番号を使ってブランチを作成してください。'
        }));
        process.exit(0);
      }
      allowed = true;
    }
    if (/^\s*git\s+(pull|fetch)\b/.test(commandLine)) allowed = true;
    if (/^\s*git\s+(status|log|branch|diff|show|rev-parse|remote)\b/.test(commandLine)) allowed = true;
    
    // Allowed gh commands
    if (/^\s*gh\s+issue\s+(create|list|view)\b/.test(commandLine)) {
      if (/^\s*gh\s+issue\s+create\b/.test(commandLine)) {
        // コマンドラインまたはファイル入力などから本文を取得するのは難しいが、
        // 少なくとも --body 引数に親Issue番号が含まれているかを簡易チェックする
        const branchIssueMatch = branch.match(/issue-(\d+)/i);
        if (branchIssueMatch && commandLine.includes('--body')) {
          const parentIssueNumber = branchIssueMatch[1];
          const regex = new RegExp(`#${parentIssueNumber}\\b`);
          if (!regex.test(commandLine)) {
            console.log(JSON.stringify({
              decision: 'deny',
              reason: `🚨 [トレーサビリティ違反] 現在のブランチ (issue-${parentIssueNumber}) からサブIssueをCLIで作成しようとしていますが、--body 内に親Issue番号 (#${parentIssueNumber}) へのリンクが見当たりません。\n孤立したIssueの発生を防ぐため、親Issueへのリンクを記載してください。`
            }));
            process.exit(0);
          }
        }
      }
      allowed = true;
    }
    if (/^\s*gh\s+pr\s+(list|view|status)\b/.test(commandLine)) allowed = true;
    if (/^\s*gh\s+repo\s+view\b/.test(commandLine)) allowed = true;
    
    if (allowed) {
      console.log(JSON.stringify({ decision: 'allow' }));
      process.exit(0);
    }
    
    console.error(`[WORKFLOW GUARD] ブランチ '${branch}' でのコマンド実行をブロックしました: ${commandLine}`);
    console.log(JSON.stringify({
      decision: 'deny',
      reason: '🚨 [ワークフロー違反] 現在のブランチは main/master です。直接のコマンド実行は禁止されています。\n\n以下の手順を実行してください:\n1. GitHub Issue を作成する (gh issue create)\n2. 作業用ブランチを作成する (git checkout -b issue-<番号>-<説明>)\n\n※ task-init スキル（/start コマンド）で自動化できます。'
    }));
    process.exit(0);
  }
  
  console.log(JSON.stringify({ decision: 'allow' }));
} catch (e) {
  console.log(JSON.stringify({ decision: 'allow' }));
}
