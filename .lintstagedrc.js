module.exports = {
  "frontend/**/*.{js,jsx,ts,tsx}": () => "npm run lint:frontend",
  "backend/**/*.py": () => "npm run lint:backend"
};
