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
    if (/^\s*gh\s+issue\s+(create|list|view)\b/.test(commandLine)) allowed = true;
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
