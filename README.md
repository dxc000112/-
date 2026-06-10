# ✦ 易填 Easy Apply CN (中文版 Simplify)

> **Chrome 求职表单一键填充助手** — 一次录入个人简历信息，所有求职网站一键填表。

`易填 Easy Apply CN` 是一款专为中国求职者设计的 Chrome 浏览器扩展程序。它类似于海外知名求职助手 **Simplify**，旨在通过智能启发式算法和浏览器原生事件模拟，帮助用户自动填入复杂的招聘系统表单，大幅节省网申时间。

---

## 🚀 核心功能

* **一键填表 (One-Click Fill)**: 一次性在插件中录入基本信息、个人背景、教育背景、求职意向以及能力介绍，在任意招聘页面点击「一键填表」即可自动填充。
* **智能启发式映射 (Heuristic Keyword Matching)**: 基于关键词字典、占位符 (`placeholder`)、标签 (`label`)、`name` 属性及 `aria-label` 自动推断表单字段含义，支持精确匹配与模糊匹配。
* **React / Vue 受控组件兼容 (Framework Bypassing)**: 突破传统浏览器自动填充无法激活框架状态绑定的难题。通过提取原型链的 `value setter` 触发原生事件更新状态。
* **100% 隐私安全 (Zero-Server Architecture)**: 数据完全加密并存储在本地浏览器的 `chrome.storage.local` 中，绝对不上传任何个人隐私至服务器。

---

## 📦 支持网站

- **主流招聘网站**:
  - [x] Boss直聘
  - [x] 猎聘网
  - [x] 前程无忧 (51job)
  - [x] 智联招聘
- **通用 Fallback 匹配**:
  - [x] 支持各大公司自建招聘系统（通用表单，如网易、腾讯、美团等官网网申系统）。

---

## ⚙️ 快速开始

### 1. 克隆并安装依赖
```bash
git clone https://github.com/dxc000112/easy-apply-cn.git
cd easy-apply-cn
npm install
```

### 2. 打包构建
```bash
npm run build
```
打包器 (`esbuild` 和 `typescript`) 将把 TypeScript 源码编译并输出至 `dist/` 文件夹。

### 3. 加载扩展程序到浏览器
1. 打开 Chrome 浏览器，访问 `chrome://extensions/`。
2. 开启右上角的 **「开发者模式」**。
3. 点击左上角 **「加载已解压的扩展程序」**。
4. 选择本项目根目录下的 `dist/` 目录。

---

## 📂 项目结构

```
easy-apply-cn/
├── dist/                # 编译输出目录（Chrome 加载该目录）
├── src/
│   ├── background/      # Service Worker (后台运行脚本)
│   ├── content/         # Content Script (注入目标网页的 DOM 交互脚本)
│   ├── popup/           # Extension 弹窗 UI (页面表单录入及控制台)
│   └── utils/
│       ├── formFiller.ts # 核心填表逻辑与启发式关键词匹配算法
│       └── storage.ts    # 封装本地存储 chrome.storage 交互
├── manifest.json        # 扩展程序清单配置文件
├── build.mjs            # 基于 esbuild 的工程化打包脚本
└── tsconfig.json        # TypeScript 编译配置
```

---

## 💡 技术内幕 & 面试辩护 (Interview Q&A)

在面试中，本项目是一个极佳的前端工程化/浏览器安全/自动化填表设计案例。以下是潜在的压力测试问答：

### Q1: 为什么常规的 `el.value = 'xxx'` 填充方法在 React/Vue 编写的表单上会失效？如何解决？
* **失效原因**: React 和 Vue 的受控组件通过双向数据绑定 (`state/value`) 来管理表单状态。当直接通过 JS 赋值 `el.value = 'xxx'` 时，仅修改了 DOM 元素的属性，但没有触发前端框架挂载的 `onChange` 或 `onInput` 事件监听器，框架内部的 `State` 并没有改变。用户点击提交时，发送的仍然是空值。
* **解决方案**: 
  我们覆写了 HTML 元素的原型链 setter，调用底层的 `nativeSetter`，并主动派发冒泡的浏览器事件：
  ```typescript
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  nativeSetter.call(el, value);
  el.dispatchEvent(new Event('input',  { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  ```
  这使得前端框架能够捕获到真实的输入状态变更并成功同步至内部 State。

### Q2: 复杂的下拉选择框 (`select`) 如何做智能适配？
* **技术方案**: 
  我们在 [formFiller.ts](file:///Users/ding/Desktop/easy-apply-cn/src/utils/formFiller.ts#L53) 中实现了一套双层匹配算法：
  1. **第一层：精确匹配**。遍历下拉列表的所有选项，如果选项的 `value` 或 `text` 与用户简历里的配置完全一致，则直接选中。
  2. **第二层：多值拆分与模糊包含匹配**。如果精确匹配失败（例如用户简历写的是“中共党员”，而网站选项是“党员/团员”），算法将用正则拆分字符串（如 `/`、`，`、`、` 等），遍历子词进行双向包含检查（`text.includes(part) || part.includes(text)`），从而智能化地完成自适应匹配。

### Q3: 你的启发式匹配算法（Heuristic Match）是如何设计优先级的？
* **优先级原则**: 
  我们将高特异性的字段（如“身份证”、“政治面貌”、“户籍”）排在匹配字典的最前面，防止它们被宽泛的通用词（如“地址”、“城市”、“学校”）误伤抢占。同时，我们通过遍历 `placeholder` -> `name` -> `id` -> `aria-label` -> 包裹 `label` 节点的文字内容进行得分排序，以此保证推断的绝对准确性。

---

## 📝 贡献指南

1. **新增支持字段**: 在 [formFiller.ts](file:///Users/ding/Desktop/easy-apply-cn/src/utils/formFiller.ts#L1) 中的 `UserProfile` 添加字段，并在 `FIELD_MAP` 中扩充关键词。
2. **新增站点适配**: 如果某个招聘系统使用了非常规的 Shadow DOM 或自定义 Canvas 输入框，可以在 `src/content/` 下添加针对性的适配模块。
