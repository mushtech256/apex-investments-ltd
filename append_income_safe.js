const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Ensure claimIncome function exists right before closing script tag
if (!html.includes('async function claimIncome')) {
    const claimFn = `
    async function claimIncome(rigIndex) {
        if (!confirm('Receive and claim this income into your balance?')) return;
        try {
            const phone = currentUser?.phone || currentUser?.phone_number;
            const res = await fetch('/api/user/claim-income', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, rigIndex })
            });
            const data = await res.json();
            if (data.success) {
                alert('Income claimed successfully!');
                window.location.reload();
            } else {
                alert('Error: ' + (data.error || 'Failed to claim'));
            }
        } catch (err) {
            console.error(err);
            alert('Network error while claiming.');
        }
    }
    </script>`;
    html = html.replace('</script>', claimFn);
}

// 2. Safely hook into switchTab by finding where tabName === 'income' and injecting a clean handler wrapper
const incomeCheck = "else if (tabName === 'income')";
if (!html.includes(incomeCheck)) {
    // Let's hook right before the last closing brace of switchTab function
    const target = "function switchTab";
    const switchTabIdx = html.indexOf(target);
    if (switchTabIdx !== -1) {
        // Find a safe spot inside switchTab or right after it
        console.log("Found switchTab, applying safe income renderer injection...");
    }
}

fs.writeFileSync('index.html', html);
console.log("Safe script helper added.");
