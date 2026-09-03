const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStart = "else if (tabName === 'income')";
const startIdx = html.indexOf(targetStart);

if (startIdx !== -1) {
    // Find the end of this block (up to the next 'else if' or closing bracket of switchTab)
    let endIdx = html.indexOf('} else if', startIdx);
    if (endIdx === -1) endIdx = html.indexOf('} \n    }', startIdx);
    if (endIdx === -1) endIdx = html.indexOf('} else {', startIdx);

    const cleanIncomeBlock = `else if (tabName === 'income') {
        title.innerText = 'Income Overview';
        if (!currentUser.rigs || currentUser.rigs.length === 0) {
            container.innerHTML = \`<div class="card" style="text-align:center; padding: 30px;"><h3 style="color:#38bdf8;">No Active Machines</h3><p style="font-size:13px; color:#cbd5e1; margin-top:10px;">Rent a mining rig from the AI tab to start earning daily automated income!</p></div>\`;
            return;
        }
        let htmlContent = \`<div class="card"><h3 style="color:#38bdf8; margin-bottom:10px;">Active Rigs & Progress</h3>\`;
        const now = new Date().getTime();
        
        currentUser.rigs.forEach((r, index) => {
            const rentedTime = new Date(r.rentedAt || now).getTime();
            let daysActive = 0;
            let curr = new Date(rentedTime);
            curr.setHours(6, 0, 0, 0);
            
            while (curr.getTime() <= now && daysActive < r.cycle) {
                const dayOfWeek = curr.getDay(); // 5 = Fri, 6 = Sat
                const isVip = (r.name && r.name.toLowerCase().includes('vip')) || (r.rigId && r.rigId.toString().toLowerCase().includes('vip'));
                if (isVip || (dayOfWeek !== 5 && dayOfWeek !== 6)) {
                    if (now >= curr.getTime()) {
                        daysActive++;
                    }
                }
                curr.setDate(curr.getDate() + 1);
            }
            daysActive = Math.min(r.cycle, daysActive);
            const daysRemaining = Math.max(0, r.cycle - daysActive);
            const currentEarned = daysActive * r.payout;
            const totalProjected = r.payout * r.cycle;
            const isCompleted = daysActive >= r.cycle;

            htmlContent += \`
                <div style="background:#0b1329; border:1px solid #1e2952; padding:14px; border-radius:8px; margin-top:12px;">
                    <h4 style="color:#38bdf8; font-size:15px; margin-bottom:4px;">\${r.name || 'Mining Rig'}</h4>
                    <p style="font-size:12px; color:#cbd5e1; margin-top:2px;">Daily Payout: <span style="color:#34d399; font-weight:bold;">UGX \${(r.payout || 0).toLocaleString()}</span></p>
                    <p style="font-size:12px; color:#cbd5e1; margin-top:2px;">Cycle Progress: <span style="color:#fff; font-weight:bold;">\${daysActive} / \${r.cycle} Days</span></p>
                    <p style="font-size:12px; color:#cbd5e1; margin-top:2px;">Days Remaining: <span style="color:#f59e0b; font-weight:bold;">\${daysRemaining} Days</span></p>
                    <p style="font-size:12px; color:#cbd5e1; margin-top:2px;">Accumulated: <span style="color:#38bdf8; font-weight:bold;">UGX \${currentEarned.toLocaleString()}</span></p>
                    <p style="font-size:12px; color:#cbd5e1; margin-top:2px;">Total Projected: <span style="color:#34d399; font-weight:bold;">UGX \${totalProjected.toLocaleString()}</span></p>
                    \${isCompleted ? \`<button onclick="claimIncome(\${index})" style="width:100%; margin-top:10px; background:linear-gradient(135deg, #10b981, #059669); color:white; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;">Receive Income (UGX \${totalProjected.toLocaleString()})</button>\` : \`<p style="font-size:11px; color:#94a3b8; margin-top:6px; font-style:italic;">Cycle in progress (Updates daily at 6:00 AM)</p>\`}
                </div>
            \`;
        });
        htmlContent += \`</div>\`;
        container.innerHTML = htmlContent;
    }`;

    // Replace from startIdx to endIdx
    html = html.substring(0, startIdx) + cleanIncomeBlock + html.substring(endIdx);
    fs.writeFileSync('index.html', html);
    console.log("Income block cleanly fixed!");
} else {
    console.log("Income block not found.");
}
