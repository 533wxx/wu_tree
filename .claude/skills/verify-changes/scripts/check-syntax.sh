#!/bin/bash
# 批量 JS 语法检查
# 用法: bash scripts/check-syntax.sh [file1.js file2.js ...]

if [ $# -eq 0 ]; then
  echo "用法: check-syntax.sh <js文件列表>"
  echo "示例: check-syntax.sh app.js data.js"
  exit 1
fi

FAILED=0
TOTAL=$#

for FILE in "$@"; do
  if [ ! -f "$FILE" ]; then
    echo "⚠️  文件不存在: $FILE"
    continue
  fi

  RESULT=$(node --check "$FILE" 2>&1)
  if [ $? -eq 0 ]; then
    echo "✅ $FILE 语法正确"
  else
    echo "❌ $FILE 语法错误:"
    echo "$RESULT" | head -5
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "检查完成: $TOTAL 个文件, $FAILED 个失败"

if [ $FAILED -gt 0 ]; then
  exit 1
fi
