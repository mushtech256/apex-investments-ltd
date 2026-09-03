const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldSuccess = `        currentUser.balance = data.balance;
        currentUser.rigs = data.rigs;
        saveUserData();

        alert(\`Successfully rented \${rig.name}!\`);
        switchTab('home', document.querySelectorAll('.nav-item')[0]);`;

const newSuccess = `        currentUser.balance = data.balance;
        currentUser.rigs = data.rigs;
        saveUserData();

        alert(\`Successfully rented \${rig.name}!\`);
        
        // Refresh Income tab if the function exists
        if (typeof renderIncome === 'function') { renderIncome(); }
        
        switchTab('income', document.querySelectorAll('.nav-item')[4]);`;

if (html.includes(oldSuccess)) {
    html = html.replace(oldSuccess, newSuccess);
    fs.writeFileSync('index.html', html);
    console.log('Successfully patched purchase UI to switch straight to Income tab!');
} else {
    console.log('Applying fallback replacement for purchase success...');
    html = html.replace(
        /alert\(`Successfully rented \${rig\.name}!`\);[\s\S]*?switchTab\([^)]+\);/,
        `alert(\`Successfully rented \${rig.name}!\`);
        if (typeof renderIncome === 'function') { renderIncome(); }
        switchTab('income', document.querySelectorAll('.nav-item')[4]);`
    );
    fs.writeFileSync('index.html', html);
    console.log('Fallback purchase UI patch applied.');
}
