module.exports = {
  "frontend/**/*.{js,jsx,ts,tsx}": () => "npm run lint:frontend",
  "backend/**/*.py": () => [
    "npm run lint:backend",
    "cd backend && uv run ruff format --check ."
  ]
};
