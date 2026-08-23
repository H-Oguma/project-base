import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const isWindows = process.platform === 'win32';

function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`> ${command}`);
    execSync(command, { stdio: 'inherit', cwd });
  } catch (error) {
    console.error(`❌ コマンドの実行に失敗しました: ${command}`);
    process.exit(1);
  }
}

function checkAndInstallUv() {
  console.log("🔍 uvコマンドのインストール状況を確認しています...");
  try {
    execSync('uv --version', { stdio: 'ignore' });
    console.log("✅ uvコマンドは既にインストールされています。");
  } catch (e) {
    console.log("⚠️ uvコマンドが見つかりません。自動インストールを開始します...");
    if (isWindows) {
      runCommand('powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"');
    } else {
      runCommand('curl -LsSf https://astral.sh/uv/install.sh | sh');
      console.log("ℹ️ 環境変数パスを通すため、必要に応じてシェルを再起動してください。");
    }
  }
}

console.log("🚀 新規プロジェクトのセットアップを開始します...\n");

rl.question("プロジェクト名を入力してください (例: my-awesome-app): ", (projectName) => {
  if (!projectName.trim()) {
    console.error("エラー: プロジェクト名が入力されていません。");
    process.exit(1);
  }

  // 1. Check and install uv
  checkAndInstallUv();

  // 2. READMEの置換
  console.log("\n📝 README.md のプロジェクト名を更新中...");
  const readmePath = path.join(process.cwd(), 'README.md');
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, 'utf8');
    content = content.replace(/AI-Driven Development Base Project/g, projectName);
    fs.writeFileSync(readmePath, content, 'utf8');
  }

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

  // 4. .gitの再初期化
  console.log("\n🗑️  既存のGit履歴を削除し、新規リポジトリとして再初期化します...");
  if (fs.existsSync(path.join(process.cwd(), '.git'))) {
    fs.rmSync(path.join(process.cwd(), '.git'), { recursive: true, force: true });
  }
  runCommand('git init');

  // Hooksの設定を復元
  if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
    console.log("🔗 Git Hooksの設定を適用します...");
    runCommand('npm run prepare');
  }

  runCommand('git add .');
  runCommand(`git commit -m "feat: initial commit for ${projectName}"`);

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
  console.log(`   gh repo create ${projectName} --public --source=. --remote=origin --push`);
  console.log("");
  console.log("4. AIに最初のタスクを依頼して開発を始めましょう:");
  console.log("   「/start [実装したい機能やタスク]」 と指示すると、");
  console.log("   自動でIssueが起票され、作業用ブランチが作成されます！");
  console.log("--------------------------------------------------");

  rl.close();
});
