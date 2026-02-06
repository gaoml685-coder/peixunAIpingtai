#!/bin/bash

# 构建脚本 - AI Foundry Demo 项目
# 用于青蝉构建平台

set -e  # 遇到错误立即退出

echo "=========================================="
echo "开始构建 AI Foundry Demo 项目"
echo "=========================================="

# 1. 清理旧的构建产物
echo "步骤1: 清理旧构建产物..."
rm -rf dist

# 2. 创建输出目录
echo "步骤2: 创建输出目录..."
mkdir -p dist/client

# 3. 复制前端静态资源到 dist/client
echo "步骤3: 复制前端文件..."
cp index.html dist/client/
cp app.js dist/client/
cp styles.css dist/client/

# 复制 .playwright-mcp 目录（如果需要）
if [ -d ".playwright-mcp" ]; then
    echo "步骤4: 复制 .playwright-mcp 资源..."
    cp -r .playwright-mcp dist/client/
fi

echo "=========================================="
echo "构建完成！"
echo "输出目录: dist/client/"
echo "=========================================="

# 列出构建产物
echo "构建产物列表:"
ls -lh dist/client/
