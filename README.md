# 易填 Easy Apply CN

中文版 Simplify — 一次录入简历，所有求职网站一键填表。

## 功能

- 录入一次个人信息（姓名、手机、邮箱、学历、求职意向等）
- 访问任意招聘网站，点击「一键填表」自动填入
- 支持 React / Vue 受控组件（解决普通 autofill 点击没反应的问题）
- 数据本地存储，不上传服务器

## 支持网站

- Boss直聘
- 猎聘
- 前程无忧
- 智联招聘
- 各公司官网招聘系统（通用 fallback）

## 安装（开发版）

```bash
npm install
npm run build
```

然后在 Chrome 进入 `chrome://extensions/` → 开发者模式 → 加载已解压的扩展程序 → 选择 `dist/` 文件夹。

## 项目结构

```
src/
├── content/      # 注入目标网站的脚本
├── popup/        # 插件弹窗 UI
├── background/   # Service Worker
└── utils/
    ├── formFiller.ts   # 核心填表逻辑
    └── storage.ts      # 本地数据存储
```
