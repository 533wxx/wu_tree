---
name: data-pipeline
description: 运行高橋吳氏宗譜数据管道。当用户说"转换数据"、"更新日期"、"运行管道"、"convert dates"时使用此技能。
version: 0.1.0
---

# 族谱数据管道

运行 `node convert-dates.js` 将干支纪年转换为公历年份。

## 管道流程

1. **运行转换**: `node convert-dates.js`
2. **验证输出**: 检查 `data.js` 中 `birthDisplay`、`birthOrder` 等计算字段
3. **抽查数据**: 随机选 3-5 条记录确认转换正确
4. **报告结果**: 处理条数、成功/失败/跳过统计

## 干支纪年对照

参考 `references/date-formats.md`

## 常见问题

- 转换后 data.js 未更新 → 检查脚本是否报错
- 部分日期未转换 → 检查原始字段格式是否符合正则
- 年份越界 → 检查干支是否在帝号在位年限内
