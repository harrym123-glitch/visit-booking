# 诺亦腾东升具身智能机器人训练中心｜预约系统

本版本已整合：

- NOITOM ROBOTICS Logo
- Noitom Robotics 中文官网风格与内容表达
- 场地介绍、能力服务、预约参观
- 预约字段：预约公司、参观人数、日期、时间
- 时间选项：10:00–18:00，每 15 分钟一个选项
- Firebase Firestore 数据保存
- 管理后台查看、删除、导出 CSV

## 后台

地址：`admin.html`

账号：`NR`

密码：`1418`

## 上传方式

把本文件夹内所有文件上传到 GitHub 仓库根目录并 Commit。等待 GitHub Pages 自动更新即可。

## 注意

如提交失败，请检查：

1. `firebase-config.js` 是否包含正确 Firebase 配置。
2. Firestore 是否已创建。
3. Firestore 规则是否允许当前读写。
