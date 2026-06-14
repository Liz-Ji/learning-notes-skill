# 学习笔记整理助手

把你看过的内容（YouTube 视频、文章、文字）自动整理成小白友好的中文笔记。

## 你会得到什么

- 📌 一句话总结
- 🧠 3-5 个核心要点
- 📖 术语大白话解释
- 💡 实际应用建议
- 🔗 原始来源链接

## 支持的输入格式

- YouTube 视频链接（自动抓取字幕）
- 文章 / 博客链接
- 直接粘贴的文字内容

## 安装

### Claude Code
```bash
git clone https://github.com/你的用户名/learning-notes.git ~/.claude/skills/learning-notes
cd ~/.claude/skills/learning-notes/scripts && npm install
```

## 系统要求

- Node.js v18 以上
- Supadata API key（免费）：https://supadata.ai
  - 注册后设置环境变量：`export SUPADATA_API_KEY=你的key`
  - 只有处理 YouTube 视频时才需要

## 快速开始

安装后，直接说：
- 「帮我整理这个视频」+ 粘贴 YouTube 链接
- 「把这篇文章做成笔记」+ 粘贴文章链接
- 「我不太懂这段话」+ 粘贴文字

## 文件结构

```
learning-notes/
├── SKILL.md                    ← AI 的工作手册（核心）
├── README.md                   ← 你现在看的这个文件
└── scripts/
    └── fetch-transcript.js     ← 自动抓取 YouTube 字幕的程序
```
