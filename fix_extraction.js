const fs = require('fs');

const robustScript = `
document.addEventListener('click', async function(e) {
  if (e.target && (e.target.classList.contains('approve-btn') || e.target.classList.contains('reject-btn') || e.target.textContent.trim() === 'Approve' || e.target.textContent.trim() === 'Reject')) {
    const card = e.target.closest('div');
    if (!card) return;
    
    const cardText = card.innerText || card.textContent || '';
    console.log("Card text captured:", cardText);

    // Look for phone number specifically after "Phone:" or any international/local format
    let phone = null;
    const phoneMatch = cardText.match(/Phone:\\s*([\\+0-9]+)/i) || cardText.match(/\\+?[0-9]{10,13}/);
    if (phoneMatch) {
      phone = phoneMatch[1] || phoneMatch[0];
      phone = phone.replace('Phone:', '').trim();
    }

    // Look for amount after "Amount:" or currency
    let amountStr = null;
    const amountMatch = cardText.match(/Amount:\\s*UGX\\s*([0-9,]+)/i) || cardText.match(/UGX\\s*([0-9,]+)/i);
    if (amountMatch) {
      amountStr = (amountMatch[1] || '').replace(/,/g, '').trim();
    }

    const actionText = e.target.textContent.trim().toLowerCase();
    const action = actionText.includes('approve') ? 'approve' : 'reject';

    if (!phone) {
      alert("Could not detect phone number. Card text was: " + cardText);
      return;
    }

    if (!confirm(\`Are you sure you want to \${action} UGX \${amountStr || '0'} for \${phone}?\`)) {
      return;
    }

    const originalText = e.target.textContent;
    try {
      e.target.disabled = true;
      e.target.textContent = "Processing...";

      const response = await fetch('/api/admin/withdrawals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: amountStr, action })
      });

      const result = await response.json();
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
      console.error(err);
      alert("Network or server error occurred.");
      e.target.disabled = false;
      e.target.textContent = originalText;
    }
  }
});
`;

fs.writeFileSync('admin-action.js', robustScript);
fs.writeFileSync('action-v3.js', robustScript);
console.log('Extraction logic updated in both action scripts!');
