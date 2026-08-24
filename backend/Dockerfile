# ビルド用ステージ
FROM python:3.11-slim AS builder

WORKDIR /app

# uvをインストール
RUN pip install --no-cache-dir uv

# 依存関係定義ファイルをコピー
COPY pyproject.toml ./

# 依存パッケージを仮想環境 (.venv) にインストール
RUN uv sync --no-install-project --no-dev

# 実行用ステージ
FROM python:3.11-slim

WORKDIR /app

# セキュリティ対策: 非rootユーザーの作成
RUN useradd -m -u 1000 appuser

# ビルドステージから仮想環境をコピー
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# アプリケーションのソースコードをコピー
COPY . .

# 所有者を appuser に変更
RUN chown -R appuser:appuser /app

# 非rootユーザーに切り替え
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
