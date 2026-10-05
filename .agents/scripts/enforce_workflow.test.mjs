// enforce_workflow.mjs（PreToolUse フック）のサブIssue関連ガードレールの結合テスト
// フックを子プロセスとして起動し、標準入力にツール呼び出しのJSONを渡して判定結果を検証する
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOOK_PATH = join(dirname(fileURLToPath(import.meta.url)), 'enforce_workflow.mjs');

let nonGitDir;
let mainRepoDir;

before(() => {
  // git 管理外のディレクトリ（ブランチ依存のチェックやネットワークアクセスを発生させない）
  nonGitDir = mkdtempSync(join(tmpdir(), 'hook-nongit-'));
  // main ブランチの一時リポジトリ（main 上で許可されるコマンドの検証用）
  mainRepoDir = mkdtempSync(join(tmpdir(), 'hook-main-'));
  const git = (...args) => execFileSync('git', args, { cwd: mainRepoDir, stdio: 'ignore' });
  git('init', '-q', '-b', 'main');
  git('-c', 'user.name=test', '-c', 'user.email=test@example.com', 'commit', '-q', '--allow-empty', '-m', 'init');
});

after(() => {
  rmSync(nonGitDir, { recursive: true, force: true });
  rmSync(mainRepoDir, { recursive: true, force: true });
});

/**
 * フックを実行して判定結果を返す
 * @param {object} toolCall フックに渡すツール呼び出し
 * @param {string} cwd 実行ディレクトリ
 */
function runHook(toolCall, cwd) {
  const result = spawnSync('node', [HOOK_PATH], {
    cwd,
    input: JSON.stringify({ toolCall }),
    encoding: 'utf-8',
    env: { ...process.env, GH_PROMPT_DISABLED: '1' },
  });
  return JSON.parse(result.stdout.trim().split('\n').pop());
}

const runCommand = (CommandLine) => ({ name: 'run_command', args: { CommandLine } });

test('CLI: 親Issue記載ありで --parent 無しの gh issue create はブロックされる', () => {
  const res = runHook(
    runCommand('gh issue create --title "子タスク" --body "親Issue: #12" --label "P2: Normal,Size: S"'),
    nonGitDir,
  );
  assert.equal(res.decision, 'deny');
  assert.match(res.reason, /--parent 12/);
});

test('CLI: --parent 付きの gh issue create は許可される', () => {
  const res = runHook(
    runCommand('gh issue create --parent 12 --title "子タスク" --body "親Issue: #12" --label "P2: Normal,Size: S"'),
    nonGitDir,
  );
  assert.equal(res.decision, 'allow');
});

test('CLI: main ブランチ上でも親Issue記載ありで --parent 無しはブロックされる', () => {
  const res = runHook(
    runCommand('gh issue create --title "子タスク" --body "親Issue: #12" --label "P2: Normal,Size: S"'),
    mainRepoDir,
  );
  assert.equal(res.decision, 'deny');
  assert.match(res.reason, /サブIssue紐付け違反/);
});

test('CLI: main ブランチ上で --parent 付きの gh issue create は許可される', () => {
  const res = runHook(
    runCommand('gh issue create --parent 12 --title "子タスク" --body "親Issue: #12" --label "P2: Normal,Size: S"'),
    mainRepoDir,
  );
  assert.equal(res.decision, 'allow');
});

test('CLI: main ブランチ上で Sub-issue 紐付け用の gh issue edit は許可される', () => {
  assert.equal(runHook(runCommand('gh issue edit 20 --parent 12'), mainRepoDir).decision, 'allow');
  assert.equal(runHook(runCommand('gh issue edit 12 --add-sub-issue 20,21'), mainRepoDir).decision, 'allow');
});

test('CLI: main ブランチ上で紐付け以外の gh issue edit は従来通りブロックされる', () => {
  assert.equal(runHook(runCommand('gh issue edit 20 --title "x"'), mainRepoDir).decision, 'deny');
});

test('MCP: 親Issue記載ありの create_issue はブロックされ gh --parent に誘導される', () => {
  const res = runHook(
    {
      name: 'call_mcp_tool',
      args: { ToolName: 'create_issue', body: '親Issue: #12', labels: ['P2: Normal', 'Size: S'] },
    },
    nonGitDir,
  );
  assert.equal(res.decision, 'deny');
  assert.match(res.reason, /gh issue create --parent 12/);
});

test('MCP: 親Issue記載なしの create_issue は従来通り許可される', () => {
  const res = runHook(
    {
      name: 'call_mcp_tool',
      args: { ToolName: 'create_issue', body: '関連Issue: #12', labels: ['P2: Normal', 'Size: S'] },
    },
    nonGitDir,
  );
  assert.equal(res.decision, 'allow');
});
