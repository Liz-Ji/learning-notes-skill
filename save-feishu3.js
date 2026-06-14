const https = require('https');
const fs = require('fs');

let content, documentId;

if (process.argv[2] === '--file') {
  const filePath = process.argv[3];
  documentId = process.argv[4];
  if (!filePath || !documentId) {
    console.error('Error: usage node save-feishu3.js --file note.txt document_id');
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.error('Error: file not found ' + filePath);
    process.exit(1);
  }
  content = fs.readFileSync(filePath, 'utf8');
} else {
  content = process.argv[2];
  documentId = process.argv[3];
  if (!content || !documentId) {
    console.error('Error: usage node save-feishu3.js content document_id');
    process.exit(1);
  }
}

const appId = process.env.FEISHU_APP_ID;
const appSecret = process.env.FEISHU_APP_SECRET;

if (!appId || !appSecret) {
  console.error('Error: FEISHU_APP_ID or FEISHU_APP_SECRET not set');
  process.exit(1);
}

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getToken() {
  console.log('Getting Feishu token...');
  const bodyStr = JSON.stringify({ app_id: appId, app_secret: appSecret });
  const res = await request({
    hostname: 'open.feishu.cn',
    path: '/open-apis/auth/v3/tenant_access_token/internal',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr)
    }
  }, bodyStr);

  if (res.status !== 200 || res.body.code !== 0) {
    throw new Error('Failed to get token, check App ID and App Secret');
  }
  console.log('Token OK!');
  return res.body.tenant_access_token;
}

function makeBlock(line) {
  const trimmed = line.trim();

  if (trimmed.startsWith('## ')) {
    return {
      block_type: 4,
      heading2: { elements: [{ text_run: { content: trimmed.replace('## ', ''), text_element_style: {} } }], style: {} }
    };
  }
  if (trimmed.startsWith('### ')) {
    return {
      block_type: 5,
      heading3: { elements: [{ text_run: { content: trimmed.replace('### ', ''), text_element_style: {} } }], style: {} }
    };
  }
  return {
    block_type: 2,
    text: { elements: [{ text_run: { content: trimmed, text_element_style: {} } }], style: {} }
  };
}

async function appendBlock(token, documentId, block) {
  const bodyStr = JSON.stringify({ children: [block], index: 0 });
  const res = await request({
    hostname: 'open.feishu.cn',
    path: '/open-apis/docx/v1/documents/' + documentId + '/blocks/' + documentId + '/children',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr)
    }
  }, bodyStr);

  if (res.status !== 200 || res.body.code !== 0) {
    throw new Error('Write failed: ' + JSON.stringify(res.body));
  }
}

async function main() {
  try {
    const token = await getToken();

    console.log('Writing to Feishu...');
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');

    for (let i = lines.length - 1; i >= 0; i--) {
      const block = makeBlock(lines[i]);
      await appendBlock(token, documentId, block);
    }
    console.log('Success! Saved to Feishu.');
  } catch (err) {
    console.error('Error: ' + err.message);
    process.exit(1);
  }
}

main();