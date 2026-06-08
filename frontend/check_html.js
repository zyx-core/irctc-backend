const fs = require('fs');
const content = fs.readFileSync('src/app/pages/home/home.html', 'utf8');

const regex = /<\/?([a-zA-Z0-9\-]+)[^>]*>/g;
let match;
let stack = [];

let lineNo = 1;
let index = 0;

function getLine(idx) {
  return content.substring(0, idx).split('\n').length;
}

while ((match = regex.exec(content)) !== null) {
  const tag = match[1];
  const isSelfClosing = match[0].endsWith('/>') || ['img', 'br', 'input', 'hr', 'link', 'meta'].includes(tag);
  const isClosing = match[0].startsWith('</');

  if (isSelfClosing) continue;

  if (isClosing) {
    if (stack.length === 0) {
      console.log(`Extra closing tag </${tag}> at line ${getLine(match.index)}`);
      break;
    }
    const last = stack.pop();
    if (last.tag !== tag) {
      console.log(`Mismatch: opened <${last.tag}> at line ${last.line}, closed </${tag}> at line ${getLine(match.index)}`);
      break;
    }
  } else {
    stack.push({ tag, line: getLine(match.index) });
  }
}

console.log("Remaining open tags:", stack.map(s => `${s.tag}:${s.line}`));
