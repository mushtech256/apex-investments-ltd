const fs = require('fs');

// Check if admin-action.js or action-v3.js exists and update it
let targetFile = fs.existsSync('admin-action.js') ? 'admin-action.js' : 'action-v3.js';
console.log("Updating target script file:", targetFile);

const robustHandler = `
// Updated withdrawal action handler
document.addEventListener('click', async function(e) {
  if (e.target && (e.target.classList.contains('approve-btn') || e.target.classList.contains('reject-btn') || e.target.textContent === 'Approve' || e.target.textContent === 'Reject')) {
    const card = e.target.closest('div');
    if (!card) return;
    
    const cardText = card.innerText || '';
    const phoneMatch = cardText.match(/\\+?[0-9]{10,13}/);
    const amountMatch = cardText.match(/UGX\\s*([0-9,]+)/i);
    
    const phone = phoneMatch ? phoneMatch[0] : null;
    const amountStr = amountMatch ? amountMatch[1].replace(/,/g, '') : null;
    const actionText = e.target.textContent.trim().toLowerCase();
    const action = (actionText.includes('approve') || e.target.classList.contains('approve-btn')) ? 'approve' : 'reject';

    if (!phone) {
      alert("Could not detect phone number on this card.");
      return;
    }

    if (!confirm(\`Are you sure you want to \${action} UGX \${amountStr || '0'} for \${phone}?\`)) {
      return;
    }

    const originalText = e.target.textContent;
    try {
      e.target.disabled = true;
      e.target.textContent = "Processing...";

      console.log("Sending action:", { phone, amount: amountStr, action });

      const response = await fetch('/api/admin/withdrawals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: amountStr, action })
      });

      const result = await response.json();
      console.log("Server response:", result);

      if (result.success) {
        alert(result.message || "Action successful!");
        card.style.transition = "all 0.3s ease";
        card.style.opacity = "0";
        setTimeout(() => card.remove(), 300);
      } else {
        alert("Error: " + (result.error || "Failed to process action"));
        e.target.disabled = false;
        e.target.textContent = originalText;
      }
    } catch (err) {
      console.error("Client fetch error:", err);
      alert("Network or server error occurred.");
      e.target.disabled = false;
      e.target.textContent = originalText;
    }
  }
});
`;

fs.writeFileSync(targetFile, robustHandler);
console.log(targetFile + ' updated successfully!');
