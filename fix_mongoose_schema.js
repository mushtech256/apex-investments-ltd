const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

// Look for user schema definition and add rigs/machines if missing
if (!server.includes('rigs:')) {
    server = server.replace(
        /const userSchema = new mongoose\.Schema\(\{([^}]+)\}\);/,
        `const userSchema = new mongoose.Schema({$1, rigs: { type: Array, default: [] }, machines: { type: Array, default: [] }});`
    );
    fs.writeFileSync('server.js', server);
    console.log('Added rigs and machines to Mongoose userSchema!');
} else {
    console.log('Schema already includes rigs or uses flexible schema.');
}
