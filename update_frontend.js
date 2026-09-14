const fs = require('fs');

// Let's check what frontend files exist to find where the click listener is
const files = fs.readdirSync('.');
console.log("Files in directory:", files);

// Look for js files or index.html that handle withdrawal actions
