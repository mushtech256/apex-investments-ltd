const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// We need to add modal HTML container if not already present
if (!html.includes('id="metricModal"')) {
  const modalHtml = `
  <!-- Metric Breakdown Modal -->
  <div id="metricModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center; padding:20px;">
    <div style="background:#111b2b; border:1px solid #1e293b; border-radius:12px; width:100%; max-width:400px; max-height:80vh; overflow-y:auto; padding:20px; color:#fff; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #1e293b; padding-bottom:10px;">
        <h3 id="modalTitle" style="margin:0; font-size:18px; color:#38bdf8;">Details</h3>
        <button onclick="document.getElementById('metricModal').style.display='none'" style="background:none; border:none; color:#aaa; font-size:22px; cursor:pointer;">&times;</button>
      </div>
      <div id="modalBody" style="font-size:14px; line-height:1.6;">
        <!-- Dynamic content goes here -->
      </div>
    </div>
  </div>
  </body>`;
  
  html = html.replace('</body>', modalHtml);
}

// Add click listeners and data fetchers to the 4 metric boxes
const scriptInjection = `
<script>
async function showMetricDetails(type) {
  const modal = document.getElementById('metricModal');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  
  modal.style.display = 'flex';
  body.innerHTML = 'Loading details...';

  try {
    const res = await fetch('/api/user/metrics-breakdown?type=' + type);
    const data = await res.json();
    
    if (!data.success) {
      body.innerHTML = '<p style="color:#ef4444;">Failed to load details.</p>';
      return;
    }

    if (type === 'deposit') {
      title.textContent = 'Deposit History';
      if (!data.items || data.items.length === 0) {
        body.innerHTML = '<p style="color:#aaa;">No deposits recorded yet.</p>';
        return;
      }
      body.innerHTML = data.items.map(item => \`
        <div style="background:#1e293b; padding:10px; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:#38bdf8;">UGX \${Number(item.amount || 0).toLocaleString()}</strong>
            <div style="font-size:11px; color:#94a3b8;">\${item.date || 'Recent'}</div>
          </div>
          <span style="background:#065f46; color:#34d399; padding:2px 8px; border-radius:4px; font-size:11px;">Completed</span>
        </div>
      \`).join('');
    } 
    else if (type === 'withdraw') {
      title.textContent = 'Withdrawal History';
      if (!data.items || data.items.length === 0) {
        body.innerHTML = '<p style="color:#aaa;">No withdrawals recorded yet.</p>';
        return;
      }
      body.innerHTML = data.items.map(item => {
        const isPending = !item.approved && item.status !== 'approved';
        const badgeBg = isPending ? '#b45309' : '#065f46';
        const badgeColor = isPending ? '#ffb703' : '#34d399';
        const statusText = isPending ? 'Pending Approval' : 'Approved';
        
        return \`
          <div style="background:#1e293b; padding:10px; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:#38bdf8;">UGX \${Number(item.amount || 0).toLocaleString()}</strong>
              <div style="font-size:11px; color:#94a3b8;">\${item.phone || ''}</div>
              <div style="font-size:10px; color:#64748b;">\${item.date || ''}</div>
            </div>
            <span style="background:\${badgeBg}; color:\${badgeColor}; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600;">\${statusText}</span>
          </div>
        \`;
      }).join('');
    }
    else if (type === 'ai_income') {
      title.textContent = 'AI Income Breakdown';
      const breakdown = data.breakdown || {};
      body.innerHTML = \`
        <div style="background:#1e293b; padding:12px; border-radius:8px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span>🤖 Machine Generation:</span>
            <strong style="color:#38bdf8;">UGX \${Number(breakdown.machines || 0).toLocaleString()}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span>🎁 Bonuses:</span>
            <strong style="color:#38bdf8;">UGX \${Number(breakdown.bonus || 0).toLocaleString()}</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>👥 Referrals:</span>
            <strong style="color:#38bdf8;">UGX \${Number(breakdown.referrals || 0).toLocaleString()}</strong>
          </div>
        </div>
        <div style="font-size:12px; color:#94a3b8; text-align:center;">Total accumulated daily active rewards.</div>
      \`;
    }
    else if (type === 'daily_earnings') {
      title.textContent = 'Daily Earnings Breakdown';
      const machines = data.machines || [];
      if (machines.length === 0) {
        body.innerHTML = '<p style="color:#aaa;">No active AI machines collecting daily earnings.</p>';
        return;
      }
      body.innerHTML = machines.map(m => \`
        <div style="background:#1e293b; padding:10px; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>\${m.name || 'AI Mining Machine'}</strong>
            <div style="font-size:11px; color:#94a3b8;">Daily Yield Rate</div>
          </div>
          <span style="color:#34d399; font-weight:bold;">+UGX \${Number(m.dailyYield || 0).toLocaleString()}</span>
        </div>
      \`).join('');
    }
  } catch (err) {
    console.error(err);
    body.innerHTML = '<p style="color:#ef4444;">Error connecting to server.</p>';
  }
}

// Attach click events to portfolio metric cards once DOM loads
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.portfolio-card, div[style*="background"]');
  cards.forEach(card => {
    const text = card.innerText || '';
    if (text.includes('Deposit details')) {
      card.style.cursor = 'pointer';
      card.onclick = () => showMetricDetails('deposit');
    } else if (text.includes('Withdraw details')) {
      card.style.cursor = 'pointer';
      card.onclick = () => showMetricDetails('withdraw');
    } else if (text.includes('Ai income')) {
      card.style.cursor = 'pointer';
      card.onclick = () => showMetricDetails('ai_income');
    } else if (text.includes('Daily earnings')) {
      card.style.cursor = 'pointer';
      card.onclick = () => showMetricDetails('daily_earnings');
    }
  });
});
</script>
</body>
`;

html = html.replace('</body>', scriptInjection);
fs.writeFileSync('index.html', html);
console.log('index.html updated with metric modals successfully!');
