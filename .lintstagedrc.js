module.exports = {
  "frontend/**/*.{js,jsx,ts,tsx}": () => "make lint-frontend",
  "backend/**/*.py": () => "make lint-backend"
};
