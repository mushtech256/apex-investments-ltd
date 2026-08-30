const fs = require('fs');
let script = fs.readFileSync('script.js', 'utf8');

// Replace or update the withdrawal list rendering to include data-id and buttons
const newCode = `adminContainer.innerHTML = list.map(w => \`
  <div data-id="\${w.id || w._id}" style="background:rgba(255,255,255,0.05); padding:10px; margin-bottom:8px; border-radius:8px;">
    <p><b>Phone:</b> \${w.phone_number || w.phone}</p>
    <p><b>Amount:</b> UGX \${w.amount}</p>
    <p><b>Status:</b> \${w.status || 'Pending'}</p>
    <div style="margin-top:8px;">
      <button class="approve-withdrawal" style="background:#10b981; color:#fff; border:none; padding:5px 12px; border-radius:4px; margin-right:5px; cursor:pointer;">Approve</button>
      <button class="reject-withdrawal" style="background:#ef4444; color:#fff; border:none; padding:5px 12px; border-radius:4px; cursor:pointer;">Reject</button>
    </div>
  </div>
\`).join('');`;

if (script.includes("adminContainer.innerHTML = list.map")) {
  script = script.replace(/adminContainer\.innerHTML\s*=\s*list\.map\([\s\S]*?\)\.join\(''\);/, newCode);
} else {
  script += "\n" + newCode;
}

fs.writeFileSync('script.js', script);
console.log('script.js updated successfully with data-id and buttons!');
