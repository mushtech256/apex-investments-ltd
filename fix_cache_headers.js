const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

const target = `app.use(express.static(path.join(__dirname)));`;
const replacement = `app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));`;

if (server.includes(target)) {
    server = server.replace(target, replacement);
    fs.writeFileSync('server.js', server);
    console.log('Successfully added no-cache headers for HTML files!');
} else {
    console.log('Could not find express.static line.');
}
