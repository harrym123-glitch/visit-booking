# 诺亦腾预约系统

上传到 GitHub Pages 即可使用。

- 前台：index.html
- 后台：admin.html
- 后台账号：NR
- 后台密码：1418
- 数据库：Firebase Firestore，集合名 bookings

如果按钮没反应，检查：
1. firebase-config.js 是否存在并包含 export。
2. Firestore 规则是否允许当前测试读写。
3. GitHub Pages 是否已更新，访问链接后加 ?v=新数字 强制刷新。
