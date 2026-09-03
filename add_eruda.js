const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('eruda')) {
    const erudaScript = '<script src="https://cdn.jsdelivr.net/npm/eruda"></script><script>eruda.init();</script>';
    html = html.replace('</head>', erudaScript + '</head>');
    fs.writeFileSync('index.html', html);
    console.log('Eruda successfully added to index.html!');
} else {
    console.log('Eruda already exists.');
}
