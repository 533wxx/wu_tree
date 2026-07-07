#!/bin/bash
# pre-commit hook — 提交前检查
# 在 .claude/settings.json 中通过 hooks 字段引用此脚本

echo "=== 提交前检查 ==="

# 检查 data.js 是否被修改
if git diff --cached --name-only | grep -q "data.js"; then
    echo "⚠️  data.js 已修改，请先运行 node convert-dates.js 更新计算字段"
    exit 1
fi

echo "✅ 检查通过"
exit 0
