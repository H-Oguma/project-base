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
  // ------------------------------------------

  // --- タスクサイズ・管理 ガードレール (ファイル編集時) ---
  if (['write_to_file', 'replace_file_content', 'multi_replace_file_content'].includes(toolName)) {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      const match = branch.match(/issue-(\d+)/i);
      if (match) {
        const issueNumber = match[1];
        // Issueのラベルを取得
        const labelsStr = execSync(`gh issue view ${issueNumber} --json labels --jq '.[].name' 2>/dev/null || echo ""`, { encoding: 'utf-8' });
        
        const hasPriority = /(P0|P1|P2|P3)/.test(labelsStr);
        const hasSize = /Size:\s*[SML]/.test(labelsStr);
        
        if (!hasPriority || !hasSize) {
          console.log(JSON.stringify({
            decision: 'deny',
            reason: `🚨 [タスク管理ガードレール] 現在作業中の Issue #${issueNumber} に「優先度（P0〜P3）」または「サイズ（Size: S/M/L）」のラベルが設定されていません。\n人間が起票時に付け忘れた場合でも、AIが作業を開始する（ファイル編集等を行う）前に、必ず \`gh issue edit ${issueNumber} --add-label "P...,Size: ..."\` を実行し、Issueの優先度とサイズを評価・付与してください。`
          }));
          process.exit(0);
        }

        if (labelsStr.includes('Size: L')) {
          console.log(JSON.stringify({
            decision: 'deny',
            reason: `🚨 [タスク管理ガードレール] 現在作業中の Issue #${issueNumber} は \`Size: L\`（エピック級）に設定されています。\nルールにより、\`Size: L\` のIssueで直接コード（ファイル）を編集することは禁止されています。\n調査や設計のみを行い、\`Size: S\` または \`M\` のサブIssueに分割してから、それぞれのブランチで実装を行ってください。`
          }));
          process.exit(0);
        }
      }
    } catch (e) {
      // ignore errors
    }
  }
  // ------------------------------------------

  // --- タスク管理ガードレール (Issue作成時) ---
  if (toolName === 'call_mcp_tool' && data.toolCall?.args?.ToolName === 'create_issue') {
    const labels = data.toolCall?.args?.labels || [];
    const hasPriority = labels.some(l => l.startsWith('P0') || l.startsWith('P1') || l.startsWith('P2') || l.startsWith('P3'));
    const hasSize = labels.some(l => l.startsWith('Size:'));
    
    if (!hasPriority || !hasSize) {
      console.log(JSON.stringify({
        decision: 'deny',
        reason: '🚨 [タスク管理ガードレール] Issueを起票する際は、必ず優先度（P0/P1/P2/P3）とサイズ（Size: S/M/L）のラベルを指定してください。\n例: `labels: ["P2: Normal", "Size: S"]`'
      }));
      process.exit(0);
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
    if (/^\s*git\s+(checkout\s+-b|switch\s+-c|branch\s)/.test(commandLine)) allowed = true;
    if (/^\s*git\s+(pull|fetch)\b/.test(commandLine)) allowed = true;
    if (/^\s*git\s+(status|log|branch|diff|show|rev-parse|remote)\b/.test(commandLine)) allowed = true;
    
    // Allowed gh commands
    if (/^\s*gh\s+issue\s+(create|list|view)\b/.test(commandLine)) {
      if (/^\s*gh\s+issue\s+create\b/.test(commandLine)) {
        const hasPriority = /(P0|P1|P2|P3)/.test(commandLine);
        const hasSize = /Size:\s*[SML]/.test(commandLine);
        if (!hasPriority || !hasSize) {
          console.log(JSON.stringify({
            decision: 'deny',
            reason: '🚨 [タスク管理ガードレール] CLIからIssueを起票する際は、必ず優先度とサイズのラベルを指定してください。\n例: `gh issue create --label "P2: Normal,Size: S"`'
          }));
          process.exit(0);
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
