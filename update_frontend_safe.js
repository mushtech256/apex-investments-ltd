const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Ensure claimIncome function exists before script tag closes
if (!html.includes('async function claimIncome')) {
    const targetScriptEnd = '</script>';
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
    html = html.replace(targetScriptEnd, claimFn);
    fs.writeFileSync('index.html', html);
    console.log("Added claimIncome helper function to index.html");
}
