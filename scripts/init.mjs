import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const isWindows = process.platform === 'win32';

// PATH に uv 等のインストール先ディレクトリを補正・追加する
function updateEnvPath() {
  const homedir = os.homedir();
  const possiblePaths = isWindows
    ? [
        path.join(homedir, '.local', 'bin'),
        path.join(homedir, '.cargo', 'bin'),
        path.join(process.env.APPDATA || '', 'astral', 'uv'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'uv'),
      ]
    : [
        path.join(homedir, '.local', 'bin'),
        path.join(homedir, '.cargo', 'bin'),
        '/usr/local/bin',
        '/opt/homebrew/bin',
      ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const currentPath = process.env.PATH || '';
      if (!currentPath.split(path.delimiter).includes(p)) {
        process.env.PATH = `${p}${path.delimiter}${currentPath}`;
      }
    }
  }
}

function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`> ${command}`);
    execSync(command, { stdio: 'inherit', cwd, env: process.env });
  } catch (error) {
    console.error(`❌ コマンドの実行に失敗しました: ${command}`);
    process.exit(1);
  }
}

function checkAndInstallUv() {
  console.log("🔍 uvコマンドのインストール状況を確認しています...");
  updateEnvPath();

  try {
    execSync('uv --version', { stdio: 'ignore', env: process.env });
    console.log("✅ uvコマンドは既にインストールされています。");
  } catch (e) {
    console.log("⚠️ uvコマンドが見つかりません。自動インストールを開始します...");
    if (isWindows) {
      runCommand('powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"');
    } else {
      runCommand('curl -LsSf https://astral.sh/uv/install.sh | sh');
    }
    // インストール後に再度 PATH を補正
    updateEnvPath();

    try {
      execSync('uv --version', { stdio: 'ignore', env: process.env });
      console.log("✅ uvコマンドのインストールとPATH補正が完了しました。");
    } catch (err) {
      console.warn("⚠️ uvコマンドのPATH補正後も実行を確認できませんでした。必要に応じてシェルを再起動してください。");
    }
  }
}

function updateProjectMeta(projectName) {
  console.log("\n📝 プロジェクト情報（README.md, package.json, pyproject.toml）を更新中...");

  // 1. README.md の置換
  const readmePath = path.join(process.cwd(), 'README.md');
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, 'utf8');
    content = content.replace(/AI-Driven Development Base Project/g, projectName);
    fs.writeFileSync(readmePath, content, 'utf8');
  }

  // 2. ルート package.json のメタ情報置換
  const rootPkgPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(rootPkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
      pkg.name = projectName;
      if (pkg.repository && typeof pkg.repository.url === 'string') {
        pkg.repository.url = pkg.repository.url.replace(/project-base/g, projectName);
      }
      if (pkg.bugs && typeof pkg.bugs.url === 'string') {
        pkg.bugs.url = pkg.bugs.url.replace(/project-base/g, projectName);
      }
      if (typeof pkg.homepage === 'string') {
        pkg.homepage = pkg.homepage.replace(/project-base/g, projectName);
      }
      fs.writeFileSync(rootPkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    } catch (e) {
      console.warn("⚠️ package.json の更新に失敗しました:", e.message);
    }
  }

  // 3. backend/pyproject.toml のメタ情報置換
  const pyprojectPath = path.join(process.cwd(), 'backend', 'pyproject.toml');
  if (fs.existsSync(pyprojectPath)) {
    try {
      let pyproject = fs.readFileSync(pyprojectPath, 'utf8');
      pyproject = pyproject.replace(/^name\s*=\s*"[^"]*"/m, `name = "${projectName}"`);
      fs.writeFileSync(pyprojectPath, pyproject, 'utf8');
    } catch (e) {
      console.warn("⚠️ backend/pyproject.toml の更新に失敗しました:", e.message);
    }
  }
}

function ensureGitUserConfig() {
  let hasName = false;
  let hasEmail = false;

  try {
    const name = execSync('git config user.name', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    hasName = name.length > 0;
  } catch (e) {}

  try {
    const email = execSync('git config user.email', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    hasEmail = email.length > 0;
  } catch (e) {}

  if (!hasName || !hasEmail) {
    console.log("\n⚠️ Git の user.name または user.email が未設定です。");
    if (!hasName) {
      console.log("  → フォールバックとして user.name を 'Developer' に設定します。");
      runCommand('git config user.name "Developer"');
    }
    if (!hasEmail) {
      console.log("  → フォールバックとして user.email を 'developer@example.com' に設定します。");
      runCommand('git config user.email "developer@example.com"');
    }
    console.log("  ※ コミット作成後に `git config user.name \"お名前\"` / `git config user.email \"メールアドレス\"` で再設定してください。");
  }
}

console.log("🚀 新規プロジェクトのセットアップを開始します...\n");

rl.question("プロジェクト名を入力してください (例: my-awesome-app): ", (projectName) => {
  const trimmedName = projectName.trim();
  if (!trimmedName) {
    console.error("エラー: プロジェクト名が入力されていません。");
    process.exit(1);
  }

  // 1. uv の確認・インストール（PATH補正付き）
  checkAndInstallUv();

  // 2. プロジェクトメタ情報の一括置換
  updateProjectMeta(trimmedName);

  // 3. 依存関係のインストール
  console.log("\n📦 依存パッケージのインストールを行います...");

  // Backend
  console.log("--> Backend (Python with uv)");
  if (fs.existsSync(path.join(process.cwd(), 'backend'))) {
    // uv sync installs dependencies and creates .venv automatically
    runCommand('uv sync', path.join(process.cwd(), 'backend'));
  }

  // Frontend
  console.log("\n--> Frontend (Node.js)");
  if (fs.existsSync(path.join(process.cwd(), 'frontend'))) {
    runCommand('npm install', path.join(process.cwd(), 'frontend'));
  }

  // Root dependencies (Husky, etc.)
  console.log("\n--> Root (Git Hooks)");
  runCommand('npm install');

  // 4. .git の再初期化
  console.log("\n🗑️  既存のGit履歴を削除し、新規リポジトリとして再初期化します...");
  if (fs.existsSync(path.join(process.cwd(), '.git'))) {
    fs.rmSync(path.join(process.cwd(), '.git'), { recursive: true, force: true });
  }
  runCommand('git init');

  // Git ユーザー設定の確認とフォールバック
  ensureGitUserConfig();

  // Hooksの設定を復元
  if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
    console.log("🔗 Git Hooksの設定を適用します...");
    runCommand('npm run prepare');
  }

  runCommand('git add .');
  runCommand(`git commit -m "feat: initial commit for ${trimmedName}"`);

  console.log("\n✅ セットアップが完了しました！");
  console.log("--------------------------------------------------");
  console.log("🔥 次のステップ:");
  console.log("1. テストとLintの実行確認:");
  console.log("   npm run test");
  console.log("   npm run lint");
  console.log("");
  console.log("2. 開発サーバーの起動:");
  console.log("   npm run dev");
  console.log("");
  console.log("3. GitHubリポジトリを作成し、Pushしてください:");
  console.log(`   gh repo create ${trimmedName} --public --source=. --remote=origin --push`);
  console.log("");
  console.log("4. AIに最初のタスクを依頼して開発を始めましょう:");
  console.log("   「/start [実装したい機能やタスク]」 と指示すると、");
  console.log("   自動でIssueが起票され、作業用ブランチが作成されます！");
  console.log("--------------------------------------------------");

  rl.close();
});
