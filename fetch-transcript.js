/**
 * fetch-transcript.js
 * 用途：通过 Supadata API 抓取 YouTube 视频字幕
 * 用法：node fetch-transcript.js "https://youtu.be/xxxxx"
 */

const https = require('https');

// 从命令行拿到视频链接
const videoUrl = process.argv[2];

if (!videoUrl) {
  console.error('错误：请提供 YouTube 链接。用法：node fetch-transcript.js "链接"');
  process.exit(1);
}

// 检查是否有 API key
const apiKey = process.env.SUPADATA_API_KEY;
if (!apiKey) {
  console.error('错误：找不到 SUPADATA_API_KEY。请先设置环境变量：export SUPADATA_API_KEY=你的key');
  process.exit(1);
}

// 从链接中提取视频 ID
function extractVideoId(url) {
  const patterns = [
    /youtu\.be\/([^?&]+)/,           // 短链接：youtu.be/xxxxx
    /youtube\.com\/watch\?v=([^&]+)/, // 标准链接：youtube.com/watch?v=xxxxx
    /youtube\.com\/embed\/([^?&]+)/   // 嵌入链接
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

const videoId = extractVideoId(videoUrl);
if (!videoId) {
  console.error('错误：无法识别这个链接，请确认是有效的 YouTube 链接。');
  process.exit(1);
}

// 调用 Supadata API 获取字幕
const options = {
  hostname: 'api.supadata.ai',
  path: `/v1/youtube/transcript?videoId=${videoId}&text=true`,
  method: 'GET',
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const result = JSON.parse(data);
      // 输出纯文本字幕，供 AI 读取
      console.log(result.content || result.text || JSON.stringify(result));
    } else if (res.statusCode === 404) {
      console.error('错误：这个视频没有字幕，或字幕不对外公开。');
      process.exit(1);
    } else if (res.statusCode === 401) {
      console.error('错误：API key 无效，请检查你的 SUPADATA_API_KEY 是否正确。');
      process.exit(1);
    } else {
      console.error(`错误：API 返回状态码 ${res.statusCode}，内容：${data}`);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('错误：网络请求失败，请检查网络连接。', e.message);
  process.exit(1);
});

req.end();
