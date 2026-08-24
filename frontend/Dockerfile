# ビルド用ステージ
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# 実行用ステージ
FROM nginx:alpine

# セキュリティ対策: 非rootユーザー(nginx)権限での実行のためのディレクトリ権限変更
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx && \
    chmod -R 777 /var/cache/nginx /var/run /var/log/nginx

# デフォルトの80番ポートを8080に変更（非rootユーザーは1024未満のポートをバインドできないため）
RUN sed -i 's/listen  *80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

USER nginx

# デフォルトの公開ディレクトリをクリーンアップ
RUN rm -rf /usr/share/nginx/html/*

# ビルドした静的ファイルをコピー
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
