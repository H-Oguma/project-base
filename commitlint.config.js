module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 日本語コミットメッセージ対応のため、subject-case 検証を無効化
    'subject-case': [0],
  },
};
