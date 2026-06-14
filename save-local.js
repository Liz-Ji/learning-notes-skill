/**
 * save-local.js
 * 用途：把笔记内容保存为 .md 文件到本地文件夹
 * 用法：node save-local.js "笔记内容" "文件名"
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const content = process.argv[2];
const filename = process.argv[3];

if (!content || !filename) {
  console.error('错误：缺少参数。用法：node save-local.js "笔记内容" "文件名"');
  process.exit(1);
}

// 默认保存路径：~/Documents/学习笔记/
// 用户可以通过环境变量 NOTES_SAVE_PATH 自定义路径
const savePath = process.env.NOTES_SAVE_PATH || path.join(os.homedir(), 'Documents', '学习笔记');

// 如果文件夹不存在，自动创建
if (!fs.existsSync(savePath)) {
  fs.mkdirSync(savePath, { recursive: true });
  console.log(`已自动创建文件夹：${savePath}`);
}

// 生成带日期的文件名，比如 2026-06-10_TLDW视频介绍.md
const today = new Date().toISOString().slice(0, 10); // 格式：YYYY-MM-DD
const safeFilename = filename.replace(/[\/\\:*?"<>|]/g, '_'); // 去掉非法字符
const fullFilename = `${today}_${safeFilename}.md`;
const fullPath = path.join(savePath, fullFilename);

// 写入文件
fs.writeFileSync(fullPath, content, 'utf8');
console.log(`保存成功：${fullPath}`);
