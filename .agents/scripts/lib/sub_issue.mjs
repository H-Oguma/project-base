/**
 * サブIssue（GitHub の Sub-issue 親子関係メタデータ）に関する共通ユーティリティ。
 *
 * - AIエージェント用フック (enforce_workflow.mjs)
 * - GitHub Actions (.github/workflows/link-sub-issue.yml)
 * の両方から利用し、「親Issue」の判定ロジックを一元管理する。
 */

/**
 * 親Issueを示す記法のパターン一覧。
 * 先頭から順に評価し、最初に一致したものを採用する。
 */
const PARENT_MARKER_PATTERNS = [
  // Issueフォーム (.github/ISSUE_TEMPLATE/task.yml) の出力形式
  // 例: "### 親Issue (もしあれば)\n\n#123"
  /###[ \t]*親[ \t]*Issue[^\r\n]*(?:\r?\n)+[ \t]*#(\d+)\b/i,
  // 本文中の明示的な記法
  // 例: "親Issue: #123" / "親Issue：#123" / "Parent: #123" / "Parent Issue: #123"
  // ※ "transparent" 等の誤検知を防ぎつつ、CLI引数内のリテラル "\n" 直後の "Parent" も検出するため後読みを使う
  /(?:親[ \t]*Issue|親イシュー|(?<=^|[^a-z]|\\n)parent(?:[ \t]+issue)?)[ \t]*[:：]?[ \t]*#(\d+)\b/i,
];

/**
 * テキスト（Issue本文やコマンドライン文字列）から親Issue番号を抽出する。
 * @param {string} text 対象テキスト
 * @returns {number | null} 親Issue番号。記載がなければ null
 */
export function extractParentIssueNumber(text) {
  if (typeof text !== 'string' || text === '') return null;
  for (const pattern of PARENT_MARKER_PATTERNS) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

/**
 * `gh issue create` / `gh issue edit` のコマンドラインから `--parent` オプションの値を抽出する。
 * `--remove-parent` には反応しない。
 * @param {string} commandLine コマンドライン文字列
 * @returns {{ raw: string, number: number | null } | null}
 *   `--parent` が無ければ null。値が番号/URLとして解釈できない場合は number が null
 */
export function extractParentFlag(commandLine) {
  if (typeof commandLine !== 'string') return null;
  const match = commandLine.match(/(?:^|\s)--parent(?:\s+|=)(["']?)([^\s"']+)\1/);
  if (!match) return null;
  const raw = match[2];
  // "123" / "#123" / "https://github.com/<owner>/<repo>/issues/123" を許容する
  const numberMatch = raw.match(/^#?(\d+)$/) || raw.match(/\/issues\/(\d+)\/?$/);
  return { raw, number: numberMatch ? Number(numberMatch[1]) : null };
}

/**
 * コマンドラインに `gh issue create` が含まれているかを判定する。
 * @param {string} commandLine コマンドライン文字列
 * @returns {boolean}
 */
export function isGhIssueCreate(commandLine) {
  return typeof commandLine === 'string' && /(?:^|[\s;&|(])gh\s+issue\s+create\b/.test(commandLine);
}

/**
 * `gh issue create` のコマンドラインがサブIssue紐付けルールに違反していないかを検査する。
 * 本文に親Issueの記載があるのに `--parent` が無い場合、または番号が食い違う場合に違反とする。
 * @param {string} commandLine コマンドライン文字列
 * @returns {string | null} 違反時は拒否理由のメッセージ、問題なければ null
 */
export function validateSubIssueCommand(commandLine) {
  if (!isGhIssueCreate(commandLine)) return null;

  const parentFromBody = extractParentIssueNumber(commandLine);
  if (parentFromBody === null) return null;

  const flag = extractParentFlag(commandLine);
  if (!flag) {
    return `🚨 [サブIssue紐付け違反] 本文に親Issue (#${parentFromBody}) が記載されていますが、\`--parent\` オプションが指定されていません。\n本文への記載だけでは GitHub の Sub-issue（親子関係メタデータ）として紐付かないため、必ず \`gh issue create --parent ${parentFromBody} ...\` の形式で起票してください。`;
  }
  if (flag.number !== null && flag.number !== parentFromBody) {
    return `🚨 [サブIssue紐付け違反] 本文に記載された親Issue (#${parentFromBody}) と \`--parent ${flag.raw}\` の番号が一致しません。どちらが正しい親Issueか確認してください。`;
  }
  return null;
}
