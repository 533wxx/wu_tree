# 常见验证模式

## 模式 1: 修改 data.js → 运行转换脚本

```bash
node convert-dates.js
# 验证: 检查 data.js 时间戳是否更新
# 验证: 抽查 birthDisplay / birthOrder 字段
```

## 模式 2: 修改 app.js / styles.css → 打开页面

```
1. 直接打开 index.html
2. F12 打开控制台，检查红色报错
3. 手动操作修改涉及的功能
4. 检查页面渲染是否正常
```

## 模式 3: 修改 index.html → 检查缓存版本号

```bash
# 确认 CSS/JS 引用中的 ?v= 版本号已递增
grep -E "(styles\.css|app\.js)\?v=" index.html
```
