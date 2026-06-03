# 场地参观预约系统 GitHub Pages + Firebase 版

## 功能
- 首页场地介绍
- 预约表单：姓名、电话、单位、参观人数、日期、时间段、备注
- 提交成功页
- 管理员后台登录
- 查看预约记录
- 删除预约记录
- 导出 CSV

## 默认后台账号
账号：admin
密码：123456

可在 `firebase-config.js` 中修改。

## 部署步骤

### 1. 创建 GitHub 仓库
1. 打开 https://github.com
2. 新建 Repository，例如：`visit-booking`
3. 上传本文件夹里的全部文件

### 2. 开启 GitHub Pages
1. 进入仓库 Settings
2. 找到 Pages
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main`，目录选择 `/root`
5. 保存

访问地址通常是：
`https://你的用户名.github.io/visit-booking/`

### 3. 创建 Firebase 项目
1. 打开 https://console.firebase.google.com
2. 创建项目
3. 添加 Web App
4. 复制 Firebase config
5. 粘贴到 `firebase-config.js`

### 4. 创建 Firestore 数据库
1. Firebase 控制台进入 Firestore Database
2. 创建数据库
3. 先选择测试模式，方便调试
4. 数据集合名称使用：`bookings`

### 5. 重新上传修改后的 `firebase-config.js`
上传到 GitHub 后，等待 GitHub Pages 自动更新。

## 注意
- 这是轻量版后台登录，适合早期测试和内部使用。
- 如果正式对外长期使用，建议后续接 Firebase Authentication，提升后台安全性。
