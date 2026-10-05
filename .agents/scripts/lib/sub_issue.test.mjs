// サブIssue判定ユーティリティの単体テスト（node:test を使用）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractParentIssueNumber,
  extractParentFlag,
  isGhIssueCreate,
  validateSubIssueCommand,
} from './sub_issue.mjs';

test('extractParentIssueNumber: 日本語・英語の記法から親Issue番号を抽出できる', () => {
  assert.equal(extractParentIssueNumber('親Issue: #12'), 12);
  assert.equal(extractParentIssueNumber('親Issue：#34'), 34);
  assert.equal(extractParentIssueNumber('親 Issue #56'), 56);
  assert.equal(extractParentIssueNumber('Parent: #7'), 7);
  assert.equal(extractParentIssueNumber('parent issue: #8'), 8);
});

test('extractParentIssueNumber: Issueフォーム (task.yml) の出力形式から抽出できる', () => {
  const body = '### 概要\n\nテスト\n\n### 親Issue (もしあれば)\n\n#123\n';
  assert.equal(extractParentIssueNumber(body), 123);
  const bodyCrlf = '### 親Issue (もしあれば)\r\n\r\n#45';
  assert.equal(extractParentIssueNumber(bodyCrlf), 45);
});

test('extractParentIssueNumber: CLI引数内のリテラル "\\n" 直後の記法も検出できる', () => {
  assert.equal(extractParentIssueNumber('--body "概要\\nParent: #9"'), 9);
  assert.equal(extractParentIssueNumber('--body "概要\\n親Issue: #10"'), 10);
});

test('extractParentIssueNumber: 親Issueの記載が無い・空欄の場合は null を返す', () => {
  assert.equal(extractParentIssueNumber(''), null);
  assert.equal(extractParentIssueNumber(undefined), null);
  assert.equal(extractParentIssueNumber('関連Issue: #12'), null);
  assert.equal(extractParentIssueNumber('transparent: #12'), null);
  assert.equal(extractParentIssueNumber('### 親Issue (もしあれば)\n\n_No response_'), null);
});

test('extractParentFlag: --parent の値を番号・URL・= 形式で解釈できる', () => {
  assert.deepEqual(extractParentFlag('gh issue create --parent 12 --title x'), { raw: '12', number: 12 });
  assert.deepEqual(extractParentFlag('gh issue create --parent=13'), { raw: '13', number: 13 });
  assert.deepEqual(extractParentFlag('gh issue create --parent "#14"'), { raw: '#14', number: 14 });
  assert.deepEqual(
    extractParentFlag('gh issue create --parent https://github.com/o/r/issues/15'),
    { raw: 'https://github.com/o/r/issues/15', number: 15 },
  );
});

test('extractParentFlag: --parent が無い・--remove-parent のみの場合は null を返す', () => {
  assert.equal(extractParentFlag('gh issue create --title x'), null);
  assert.equal(extractParentFlag('gh issue edit 3 --remove-parent'), null);
});

test('isGhIssueCreate: gh issue create を検出できる', () => {
  assert.equal(isGhIssueCreate('gh issue create --title x'), true);
  assert.equal(isGhIssueCreate('cd repo && gh issue create --title x'), true);
  assert.equal(isGhIssueCreate('gh issue edit 3 --parent 1'), false);
  assert.equal(isGhIssueCreate('gh issue list'), false);
});

test('validateSubIssueCommand: 親Issue記載ありで --parent 無しは違反', () => {
  const reason = validateSubIssueCommand('gh issue create --title x --body "親Issue: #12" --label "P2: Normal,Size: S"');
  assert.match(reason, /--parent 12/);
});

test('validateSubIssueCommand: 親Issue番号と --parent が食い違う場合は違反', () => {
  const reason = validateSubIssueCommand('gh issue create --parent 13 --title x --body "親Issue: #12"');
  assert.match(reason, /一致しません/);
});

test('validateSubIssueCommand: 正しく --parent が指定されていれば問題なし', () => {
  assert.equal(validateSubIssueCommand('gh issue create --parent 12 --title x --body "親Issue: #12"'), null);
  assert.equal(
    validateSubIssueCommand('gh issue create --parent https://github.com/o/r/issues/12 --body "親Issue: #12"'),
    null,
  );
});

test('validateSubIssueCommand: 親Issue記載なし・gh issue create 以外は対象外', () => {
  assert.equal(validateSubIssueCommand('gh issue create --title x --body "関連Issue: #12"'), null);
  assert.equal(validateSubIssueCommand('echo "親Issue: #12"'), null);
});
