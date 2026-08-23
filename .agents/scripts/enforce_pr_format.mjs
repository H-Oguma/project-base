import fs from 'fs';

try {
  const input = fs.readFileSync(0, 'utf-8');
  if (!input.trim()) {
    console.log(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }
  
  const data = JSON.parse(input);
  const toolName = data.toolCall?.name;
  
  if (toolName !== 'run_command') {
    console.log(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }
  
  const commandLine = data.toolCall?.args?.CommandLine || '';
  
  if (/(^|\s)gh\s+pr\s+create\b/.test(commandLine)) {
    console.log(JSON.stringify({
      decision: 'deny',
      reason: '🚨 [PR直接作成禁止] gh pr create コマンドの直接実行は禁止されています。\n\n必ず create-pr スキル（/pr コマンド）を使用してPRを作成してください。'
    }));
    process.exit(0);
  }
  
  console.log(JSON.stringify({ decision: 'allow' }));
} catch (e) {
  console.log(JSON.stringify({ decision: 'allow' }));
}
