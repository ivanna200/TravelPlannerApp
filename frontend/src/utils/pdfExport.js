import { formatDate, formatDateRange } from './formatDate';

const STATUS_COLORS = {
  'Planirano':   '#0ea5e9',
  'Rezervisano': '#8b5cf6',
  'Završeno':    '#10b981',
  'Otkazano':    '#f43f5e',
};

const CATEGORY_ICONS = {
  'Prevoz':   '✈️',
  'Smještaj': '🏨',
  'Hrana':    '🍽️',
  'Ulaznice': '🎟️',
  'Kupovina': '🛍️',
  'Ostalo':   '📦',
};

export const generatePlanPDF = ({ plan, destinations, activities, expenses, checklist, budgetSummary }) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Dozvolite pop-up prozore da biste preuzeli PDF izvještaj.');
    return;
  }

  const completedItems = (checklist || []).filter(c => c.isCompleted).length;

  const budgetPct = budgetSummary && budgetSummary.plannedBudget > 0
    ? Math.min((budgetSummary.totalExpenses / budgetSummary.plannedBudget) * 100, 100).toFixed(0)
    : '0';

  const actByDate = (activities || []).reduce((acc, a) => {
    const key = formatDate(a.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const html = `
<!DOCTYPE html>
<html lang="bs">
<head>
  <meta charset="UTF-8" />
  <title>TravelPlanner — ${plan.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #1e293b;
      background: #fff;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 20px;
      border-bottom: 2px solid #1E3A5F;
      margin-bottom: 24px;
    }
    .header-left h1 { font-size: 22px; font-weight: 800; color: #1E3A5F; margin-bottom: 4px; }
    .header-left p  { color: #64748b; font-size: 12px; }
    .header-right   { text-align: right; font-size: 11px; color: #94a3b8; }
    .logo { font-size: 18px; font-weight: 800; color: #1E3A5F; }
    .section { margin-bottom: 24px; }
    .section-title {
      font-size: 14px; font-weight: 700; color: #1E3A5F;
      padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;
      margin-bottom: 12px;
    }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .info-card .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .info-card .value { font-size: 14px; font-weight: 700; color: #1e293b; }
    .budget-bar-wrap { background: #e2e8f0; border-radius: 4px; height: 8px; margin: 8px 0; overflow: hidden; }
    .budget-bar { height: 8px; border-radius: 4px; }
    .dest-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 10px; background: #f8fafc; border-radius: 8px;
      margin-bottom: 8px; border-left: 3px solid #0ea5e9;
    }
    .dest-num {
      width: 24px; height: 24px; background: #0ea5e9; color: white;
      border-radius: 6px; display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; flex-shrink: 0;
    }
    .date-group { margin-bottom: 14px; }
    .date-label {
      font-size: 11px; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: 0.5px;
      padding-bottom: 4px; border-bottom: 1px solid #f1f5f9; margin-bottom: 6px;
    }
    .act-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 10px; background: #f8fafc; border-radius: 6px; margin-bottom: 4px;
    }
    .act-status { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 10px; color: white; white-space: nowrap; }
    .act-meta { font-size: 11px; color: #64748b; }
    .check-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .check-item { display: flex; align-items: center; gap: 6px; font-size: 12px; padding: 4px 0; }
    .check-box {
      width: 14px; height: 14px; border: 2px solid #cbd5e1; border-radius: 3px;
      flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    }
    .check-box.done { background: #10b981; border-color: #10b981; color: white; font-size: 9px; }
    .notes-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; font-size: 12px; color: #92400e; }
    .footer {
      margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;
    }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-left">
      <h1>${plan.name}</h1>
      <p>${plan.description || 'Plan putovanja'}</p>
    </div>
    <div class="header-right">
      <div class="logo">✈️ TravelPlanner</div>
      <div style="margin-top:4px;">Generisano: ${formatDate(new Date())}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">📋 Osnovni podaci</div>
    <div class="info-grid">
      <div class="info-card">
        <div class="label">Period putovanja</div>
        <div class="value">${formatDateRange(plan.startDate, plan.endDate)}</div>
      </div>
      <div class="info-card">
        <div class="label">Planirani budžet</div>
        <div class="value" style="color:#059669;">${plan.budget?.toLocaleString()} €</div>
      </div>
      <div class="info-card">
        <div class="label">Destinacije / Aktivnosti</div>
        <div class="value">${(destinations || []).length} / ${(activities || []).length}</div>
      </div>
    </div>
    ${plan.notes ? `<div class="notes-box">📝 ${plan.notes}</div>` : ''}
  </div>

  ${budgetSummary ? `
  <div class="section">
    <div class="section-title">💰 Finansijski pregled</div>
    <div class="info-grid">
      <div class="info-card">
        <div class="label">Planirani budžet</div>
        <div class="value">${budgetSummary.plannedBudget} €</div>
      </div>
      <div class="info-card">
        <div class="label">Potrošeno</div>
        <div class="value" style="color:#f43f5e;">${budgetSummary.totalExpenses} €</div>
      </div>
      <div class="info-card">
        <div class="label">Preostalo</div>
        <div class="value" style="color:${budgetSummary.remainingBudget >= 0 ? '#059669' : '#f43f5e'};">
          ${budgetSummary.remainingBudget} €
        </div>
      </div>
    </div>
    <div class="budget-bar-wrap">
      <div class="budget-bar" style="width:${budgetPct}%;background:${budgetPct > 90 ? '#f43f5e' : budgetPct > 70 ? '#f59e0b' : '#10b981'};"></div>
    </div>
    <div style="font-size:11px;color:#64748b;text-align:right;">${budgetPct}% budžeta iskorišćeno</div>
  </div>
  ` : ''}

  ${(destinations || []).length > 0 ? `
  <div class="section">
    <div class="section-title">📍 Destinacije (${destinations.length})</div>
    ${destinations.map((d, i) => `
      <div class="dest-item">
        <div class="dest-num">${i + 1}</div>
        <div style="flex:1;">
          <div style="font-weight:700;">${d.name}</div>
          <div style="font-size:11px;color:#64748b;">${d.location} · ${formatDateRange(d.arrivalDate, d.departureDate)}</div>
          ${d.description ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;">${d.description}</div>` : ''}
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${(activities || []).length > 0 ? `
  <div class="section">
    <div class="section-title">🗓️ Raspored aktivnosti (${activities.length})</div>
    ${Object.entries(actByDate).map(([date, acts]) => `
      <div class="date-group">
        <div class="date-label">${date}</div>
        ${acts.map(a => `
          <div class="act-item">
            <div class="act-status" style="background:${STATUS_COLORS[a.status] || '#64748b'};">${a.status}</div>
            <div style="flex:1;">
              <div style="font-weight:600;">${a.name}</div>
              <div class="act-meta">
                ${a.time ? `🕐 ${a.time}` : ''}
                ${a.location ? ` · 📍 ${a.location}` : ''}
                ${a.estimatedCost > 0 ? ` · 💰 ${a.estimatedCost} €` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${(expenses || []).length > 0 ? `
  <div class="section">
    <div class="section-title">💳 Evidencija troškova (${expenses.length})</div>
    <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;padding:8px 12px;background:#f8fafc;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">
        <span>Naziv</span><span>Kategorija</span><span>Datum</span><span>Iznos</span>
      </div>
      ${expenses.map(exp => `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;padding:8px 12px;border-top:1px solid #f1f5f9;font-size:12px;align-items:center;">
          <span style="font-weight:600;">${exp.name}</span>
          <span>${CATEGORY_ICONS[exp.category] || '📦'} ${exp.category}</span>
          <span style="color:#64748b;">${exp.date ? formatDate(exp.date) : '—'}</span>
          <span style="font-weight:700;white-space:nowrap;">${exp.amount} €</span>
        </div>
      `).join('')}
      <div style="display:grid;grid-template-columns:1fr auto;padding:10px 12px;background:#f8fafc;border-top:2px solid #e2e8f0;font-weight:700;">
        <span>Ukupno</span>
        <span style="color:#f43f5e;">${budgetSummary?.totalExpenses ?? expenses.reduce((s, e) => s + e.amount, 0)} €</span>
      </div>
    </div>
  </div>
  ` : ''}

  ${(checklist || []).length > 0 ? `
  <div class="section">
    <div class="section-title">✅ Packing lista (${completedItems}/${checklist.length} završeno)</div>
    <div class="check-grid">
      ${checklist.map(item => `
        <div class="check-item">
          <div class="check-box ${item.isCompleted ? 'done' : ''}">${item.isCompleted ? '✓' : ''}</div>
          <span style="${item.isCompleted ? 'text-decoration:line-through;color:#94a3b8;' : ''}">${item.name}</span>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <span>TravelPlanner — Plan putovanja</span>
    <span>Generisano ${new Date().toLocaleDateString('bs-BA')} u ${new Date().toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' })}</span>
  </div>

  <script>
    window.onload = () => { window.print(); window.onafterprint = () => window.close(); };
  </script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
};
