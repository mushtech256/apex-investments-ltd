const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let targetFile = fs.existsSync('admin-action.js') ? 'admin-action.js' : 'action-v3.js';

if (!html.includes(targetFile)) {
  html = html.replace('</body>', `<script src="${targetFile}"></script>\n</body>`);
  fs.writeFileSync('index.html', html);
  console.log(`Injected ${targetFile} into index.html`);
} else {
  console.log(`${targetFile} is already present in index.html`);
}
