#!/bin/bash

echo "🚀 开始配置EAS项目..."

# 检查是否已登录EAS
echo "📋 检查EAS登录状态..."
if ! eas whoami &>/dev/null; then
    echo "❌ 您需要先登录EAS账户"
    echo "请运行: npx eas@latest login"
    exit 1
fi

# 创建EAS项目
echo "🏗️  创建EAS项目..."
eas project:info --non-interactive

# 获取项目ID
PROJECT_ID=$(eas project:info --non-interactive | grep "Project ID" | awk '{print $3}')

if [ -z "$PROJECT_ID" ]; then
    echo "❌ 无法获取项目ID，尝试创建新项目..."
    eas project:create --non-interactive
    PROJECT_ID=$(eas project:info --non-interactive | grep "Project ID" | awk '{print $3}')
fi

if [ -z "$PROJECT_ID" ]; then
    echo "❌ 项目配置失败"
    exit 1
fi

echo "✅ 项目ID: $PROJECT_ID"

# 更新app.json文件
echo "📝 更新app.json..."
sed -i.bak "s/your-project-id-here/$PROJECT_ID/" app.json

echo "✅ EAS项目配置完成!"
echo "📊 项目信息:"
eas project:info

echo ""
echo "🎯 下一步操作:"
echo "1. eas build --platform android --profile preview    # 构建预览版本"
echo "2. eas build --platform android --profile production # 构建生产版本"