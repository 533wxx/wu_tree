#!/bin/bash
# 运行日期转换管道并验证
# 用法: bash scripts/convert.sh [--verify]

cd "$(dirname "$0")/../.."

echo "=== 运行日期转换 ==="
node convert-dates.js
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "❌ 转换脚本失败 (退出码: $EXIT_CODE)"
  exit $EXIT_CODE
fi

if [[ "$*" == *"--verify"* ]]; then
  echo ""
  echo "=== 验证转换结果 ==="

  # 检查 data.js 是否在最近 1 分钟内被修改
  if [ -f "data.js" ]; then
    MODIFIED=$(stat -c %Y "data.js" 2>/dev/null || echo 0)
    NOW=$(date +%s)
    DIFF=$((NOW - MODIFIED))

    if [ $DIFF -lt 60 ]; then
      echo "✅ data.js 已更新 ($DIFF 秒前)"
    else
      echo "⚠️  data.js 最后修改于 $DIFF 秒前"
    fi
  fi

  # 检查 birthDisplay 字段
  COUNT=$(grep -c '"birthDisplay"' data.js 2>/dev/null || echo 0)
  echo "📊 birthDisplay 字段数: $COUNT"
fi

echo ""
echo "✅ 管道完成"
