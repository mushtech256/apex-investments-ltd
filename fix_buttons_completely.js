const fs = require('fs');

// 1. Update the frontend click handler to pull data directly from button attributes
const robustHandler = `
document.addEventListener('click', async function(e) {
  if (e.target && (e.target.classList.contains('approve-btn') || e.target.classList.contains('reject-btn') || e.target.textContent.trim() === 'Approve' || e.target.textContent.trim() === 'Reject')) {
    const btn = e.target;
    const card = btn.closest('div') || btn.parentElement;
    
    // Read directly from data attributes if available, or fall back to text parsing
    let phone = btn.getAttribute('data-phone');
    let amountStr = btn.getAttribute('data-amount');

    if (!phone) {
      // Traverse up to find card text containing phone
      let parent = card;
      let text = '';
      while (parent && parent !== document.body) {
        text = parent.innerText || parent.textContent || '';
        const match = text.match(/\\+?[0-9]{10,13}/);
        if (match) {
          phone = match[0];
          break;
        }
        parent = parent.parentElement;
      }
    }

    if (!amountStr) {
      let parent = card;
      while (parent && parent !== document.body) {
        const text = parent.innerText || parent.textContent || '';
        const match = text.match(/UGX\\s*([0-9,]+)/i);
        if (match) {
          amountStr = match[1].replace(/,/g, '').trim();
          break;
        }
        parent = parent.parentElement;
      }
    }

    const actionText = btn.textContent.trim().toLowerCase();
    const action = actionText.includes('approve') ? 'approve' : 'reject';

    if (!phone) {
      alert("Could not detect phone number for this withdrawal.");
      return;
    }

    if (!confirm(\`Are you sure you want to \${action} UGX \${amountStr || '0'} for \${phone}?\`)) {
      return;
    }

    const originalText = btn.textContent;
    try {
      btn.disabled = true;
      btn.textContent = "Processing...";

      const response = await fetch('/api/admin/withdrawals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: amountStr, action })
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message || "Action successful!");
        // Find the outermost card container to remove
        let outerCard = btn.closest('.withdrawal-card') || card.closest('div[style*="background"], div[class]') || card;
        outerCard.style.transition = "all 0.3s ease";
        outerCard.style.opacity = "0";
        setTimeout(() => outerCard.remove(), 300);
      } else {
        alert("Error: " + (result.error || "Failed to process action"));
        btn.disabled = false;
        btn.textContent = originalText;
      }
    } catch (err) {
      console.error(err);
      alert("Network or server error occurred.");
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
});
`;

fs.writeFileSync('admin-action.js', robustHandler);
fs.writeFileSync('action-v3.js', robustHandler);
console.log('Updated click handlers!');

// 2. Also check if there is code rendering the pending withdrawals list in any JS file and inject data attributes if found
let files = fs.readdirSync('.');
for (let file of files) {
  if (file.endsWith('.js') && file !== 'server.js') {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('Approve') && content.includes('Reject') && !content.includes('data-phone')) {
      // Inject data attributes into dynamically generated buttons if possible
      content = content.replace(/<button([^>]+)Approve<\/button>/gi, '<button$1 data-phone="${w.phone}" data-amount="${w.amount}" class="approve-btn">Approve</button>');
      fs.writeFileSync(file, content);
      console.log('Injected data attributes into renderer:', file);
    }
  }
}
