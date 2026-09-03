const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

// Find the login response return statement
if (server.includes("Login successful") && !server.includes("rigs:")) {
    // Replace the user object return to include rigs
    server = server.replace(
        /res\.json\(\{\s*message:\s*'Login successful',\s*user:\s*\{([^}]+)\}\s*\}\);/,
        (match, inner) => {
            if (!inner.includes('rigs')) {
                return `res.json({ message: 'Login successful', user: {${inner}, rigs: user.rigs || [] } });`;
            }
            return match;
        }
    );
    fs.writeFileSync('server.js', server);
    console.log('Successfully added rigs to login response!');
} else {
    console.log('Already patched or login response pattern not matched.');
}
