#!/usr/bin/env bash
# 部署 VitePress 站点到阿里云服务器（47.96.4.59）
# 用法: npm run deploy
set -euo pipefail

SERVER="root@47.96.4.59"
REMOTE_DIR="/var/www/wiki/"
LOCAL_DIR=".vitepress/dist/"

cd "$(dirname "$0")/.."

echo "==> 构建站点..."
npm run docs:build

echo "==> 同步到 ${SERVER}:${REMOTE_DIR}"
rsync -az --delete -e "ssh -o BatchMode=yes" "${LOCAL_DIR}" "${SERVER}:${REMOTE_DIR}"

echo "==> 完成。访问 https://wiki.iaimer.com"
