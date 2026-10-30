/**
 * Star Digital Affiliate Marketing
 * Home Landing Page Script
 * Synchronizes Campaign Name across Continuous Flow and Manages All Saved Scenarios
 */

(() => {
  'use strict';

  const elements = {
    campaignNameInput: document.getElementById('homeCampaignNameInput'),
    btnStartWorkflow: document.getElementById('btnStartWorkflow'),
    linkToAcceptance: document.getElementById('linkToAcceptance'),
    linkToTracker: document.getElementById('linkToTracker'),

    // Saved Scenarios Modal
    btnOpenHomeScenarios: document.getElementById('btnOpenHomeScenarios'),
    homeSavedScenarioCount: document.getElementById('homeSavedScenarioCount'),
    homeScenarioModal: document.getElementById('homeScenarioModal'),
    closeHomeScenarioModalBtn: document.getElementById('closeHomeScenarioModalBtn'),
    btnHomeSaveNewScenario: document.getElementById('btnHomeSaveNewScenario'),
    homeScenarioListContainer: document.getElementById('homeScenarioListContainer'),

    // Export Scenarios Menu
    homeExportDropdownContainer: document.getElementById('homeExportDropdownContainer'),
    btnExportScenariosMenu: document.getElementById('btnExportScenariosMenu'),
    homeExportMenu: document.getElementById('homeExportMenu'),
    exportScenariosCsvBtn: document.getElementById('exportScenariosCsvBtn'),
    exportScenariosPngBtn: document.getElementById('exportScenariosPngBtn'),
    exportScenariosPdfBtn: document.getElementById('exportScenariosPdfBtn'),

    // Granular Save Modal
    granularSaveModal: document.getElementById('granularSaveModal'),
    saveScenarioNameInput: document.getElementById('saveScenarioNameInput'),
    closeGranularSaveBtn: document.getElementById('closeGranularSaveBtn'),
    cancelGranularSaveBtn: document.getElementById('cancelGranularSaveBtn'),
    confirmGranularSaveBtn: document.getElementById('confirmGranularSaveBtn'),
    granularModalTitle: document.getElementById('granularModalTitle'),

    toastContainer: document.getElementById('toastContainer')
  };

  let editingScenarioId = null;

  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <span>${message}</span>
      </div>
    `;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  function syncCampaignName() {
    const name = elements.campaignNameInput.value.trim() || 'Star Digital Campaign';
    StarDigitalStore.setActiveCampaignName(name);

    // Also update active tracker state scenario name so it carries forward
    const currentTracker = StarDigitalStore.getTrackerState();
    currentTracker.scenarioName = name;
    StarDigitalStore.setTrackerState(currentTracker);
  }

  function updateScenarioCount() {
    const list = StarDigitalStore.getSavedScenarios();
    if (elements.homeSavedScenarioCount) {
      elements.homeSavedScenarioCount.textContent = list.length;
    }
  }

  function renderScenarioList() {
    const list = StarDigitalStore.getSavedScenarios();
    elements.homeScenarioListContainer.innerHTML = '';

    if (list.length === 0) {
      elements.homeScenarioListContainer.innerHTML = `
        <div class="empty-scenarios" style="text-align: center; padding: 32px 16px; color: var(--text-muted)">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px; opacity: 0.7"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          <p>No saved scenarios found yet. Enter your parameters and click "Save Current State" or save while inside the tools.</p>
        </div>
      `;
      return;
    }

    list.forEach(sc => {
      const item = document.createElement('div');
      item.className = 'scenario-item';

      let scopeBadge = '<span class="status-pill badge-purple">All (Continuous)</span>';
      let detailsHtml = '';

      if (sc.scope === 'acceptance_only') {
        scopeBadge = '<span class="status-pill badge-emerald">Acceptance Only</span>';
        if (sc.acceptance?.overall) {
          detailsHtml = `Tapped: <strong>${sc.acceptance.overall.tapped}</strong> &bull; Onboarded: <strong>${sc.acceptance.overall.onboarded}</strong>`;
        }
      } else if (sc.scope === 'tracker_only') {
        scopeBadge = '<span class="status-pill badge-yellow">Tracker Only</span>';
        if (sc.tracker) {
          detailsHtml = `Target: <strong>${sc.tracker.cumulativeTarget}</strong> &bull; Conv: <strong>${sc.tracker.conversionRate}%</strong> &bull; Days: <strong>${sc.tracker.campaignDays}d</strong>`;
        }
      } else {
        const acceptInfo = sc.acceptance?.overall ? `Tapped: ${sc.acceptance.overall.tapped} / Onboarded: ${sc.acceptance.overall.onboarded}` : '';
        const trackerInfo = sc.tracker ? `Target: ${sc.tracker.cumulativeTarget} (@ ${sc.tracker.conversionRate}%)` : '';
        detailsHtml = `${acceptInfo ? acceptInfo + ' &bull; ' : ''}${trackerInfo}`;
      }

      const dateStr = sc.timestamp ? new Date(sc.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

      item.innerHTML = `
        <div class="scenario-info">
          <div class="scenario-info-title">
            <span>${escapeHtml(sc.name)}</span>
            ${scopeBadge}
            <button class="btn btn-ghost btn-sm btn-rename" data-id="${sc.id}" title="Rename scenario" style="padding: 2px 6px; font-size: 11px;">
              ✏️ Rename
            </button>
          </div>
          <div class="scenario-info-meta">
            ${detailsHtml}
            ${dateStr ? ` &bull; <span style="color: var(--text-muted)">${dateStr}</span>` : ''}
          </div>
        </div>
        <div class="scenario-item-actions">
          <button class="btn btn-sm btn-primary btn-load-flow" data-id="${sc.id}">Load &amp; Open</button>
          <div class="dropdown scenario-export-dropdown" data-id="${sc.id}">
            <button class="btn btn-sm btn-secondary btn-export-scenario-menu" data-id="${sc.id}" title="Export this scenario">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="dropdown-menu">
              <button class="dropdown-item btn-export-one-csv" data-id="${sc.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                Export as CSV
              </button>
              <button class="dropdown-item btn-export-one-png" data-id="${sc.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Export as PNG
              </button>
              <button class="dropdown-item btn-export-one-pdf" data-id="${sc.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Export as PDF
              </button>
            </div>
          </div>
          <button class="btn btn-sm btn-ghost btn-delete" data-id="${sc.id}" title="Delete" style="color: #ef4444">&times;</button>
        </div>
      `;

      elements.homeScenarioListContainer.appendChild(item);
    });

    // Listeners
    elements.homeScenarioListContainer.querySelectorAll('.btn-load-flow').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const scenario = StarDigitalStore.getSavedScenarios().find(s => s.id === id);
        if (scenario) {
          StarDigitalStore.loadScenarioToActive(scenario);
          showToast(`Loaded scenario: "${scenario.name}"`);
          setTimeout(() => {
            if (scenario.scope === 'tracker_only') {
              window.location.href = 'tracker.html';
            } else {
              window.location.href = 'acceptance-rate.html';
            }
          }, 300);
        }
      });
    });

    elements.homeScenarioListContainer.querySelectorAll('.btn-rename').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        promptRename(id);
      });
    });

    elements.homeScenarioListContainer.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        StarDigitalStore.deleteSavedScenario(id);
        renderScenarioList();
        updateScenarioCount();
        showToast('Scenario removed.');
      });
    });

    // Per-scenario export dropdown toggles
    elements.homeScenarioListContainer.querySelectorAll('.btn-export-scenario-menu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = btn.closest('.scenario-export-dropdown');
        // Close all other open dropdowns first
        elements.homeScenarioListContainer.querySelectorAll('.scenario-export-dropdown.open').forEach(d => {
          if (d !== dropdown) d.classList.remove('open');
        });
        dropdown.classList.toggle('open');
      });
    });

    // Per-scenario CSV
    elements.homeScenarioListContainer.querySelectorAll('.btn-export-one-csv').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const sc = StarDigitalStore.getSavedScenarios().find(s => s.id === id);
        if (sc) {
          btn.closest('.scenario-export-dropdown').classList.remove('open');
          exportOneScenarioCSV(sc);
        }
      });
    });

    // Per-scenario PNG
    elements.homeScenarioListContainer.querySelectorAll('.btn-export-one-png').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const sc = StarDigitalStore.getSavedScenarios().find(s => s.id === id);
        if (sc) {
          btn.closest('.scenario-export-dropdown').classList.remove('open');
          exportOneScenarioPNG(sc);
        }
      });
    });

    // Per-scenario PDF
    elements.homeScenarioListContainer.querySelectorAll('.btn-export-one-pdf').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const sc = StarDigitalStore.getSavedScenarios().find(s => s.id === id);
        if (sc) {
          btn.closest('.scenario-export-dropdown').classList.remove('open');
          exportOneScenarioPDF(sc);
        }
      });
    });

    // Close per-scenario dropdowns on outside click
    document.addEventListener('click', () => {
      elements.homeScenarioListContainer?.querySelectorAll('.scenario-export-dropdown.open').forEach(d => d.classList.remove('open'));
    });
  }

  function promptRename(id) {
    const list = StarDigitalStore.getSavedScenarios();
    const sc = list.find(s => s.id === id);
    if (!sc) return;

    editingScenarioId = id;
    elements.granularModalTitle.textContent = 'Rename Scenario';
    elements.saveScenarioNameInput.value = sc.name;
    document.querySelector('.save-scope-options').parentElement.style.display = 'none'; // hide scope on rename
    elements.granularSaveModal.classList.add('open');
    elements.saveScenarioNameInput.focus();
  }

  function promptSaveNew() {
    editingScenarioId = null;
    elements.granularModalTitle.textContent = 'Save Campaign Scenario';
    const activeName = StarDigitalStore.getActiveCampaignName();
    elements.saveScenarioNameInput.value = activeName || 'Q4 Seeding Campaign';
    document.querySelector('.save-scope-options').parentElement.style.display = 'block';
    elements.granularSaveModal.classList.add('open');
    elements.saveScenarioNameInput.focus();
  }

  function confirmSave() {
    const name = elements.saveScenarioNameInput.value.trim() || 'Custom Scenario';
    if (editingScenarioId) {
      StarDigitalStore.renameSavedScenario(editingScenarioId, name);
      showToast(`Renamed to "${name}"`);
    } else {
      const selectedScope = document.querySelector('input[name="scenarioSaveScope"]:checked')?.value || 'all';
      StarDigitalStore.addSavedScenario({
        name,
        scope: selectedScope
      });
      showToast(`Saved scenario "${name}"!`);
    }

    elements.granularSaveModal.classList.remove('open');
    renderScenarioList();
    updateScenarioCount();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // --- Individual Scenario Export Functions ---
  function exportOneScenarioCSV(sc) {
    const tm = computeTrackerMetrics(sc.tracker);
    const name = sc.name || 'Untitled';
    const safeName = name.replace(/[^a-z0-9_-]/gi, '_');

    let csv = `Scenario Name,${name}\n`;
    csv += `Scope,${sc.scope || 'all'}\n`;
    csv += `Date Saved,${sc.timestamp ? new Date(sc.timestamp).toLocaleString() : ''}\n\n`;

    if (sc.acceptance?.overall) {
      csv += `Tapped Creators,${sc.acceptance.overall.tapped}\n`;
      csv += `Onboarded Creators,${sc.acceptance.overall.onboarded}\n`;
      const rate = sc.acceptance.overall.tapped > 0 ? ((sc.acceptance.overall.onboarded / sc.acceptance.overall.tapped) * 100).toFixed(1) : '';
      csv += `Acceptance Rate,${rate}%\n`;
    }

    if (tm) {
      csv += `\nTracker Parameters\n`;
      csv += `Conversion Rate,${tm.ratePercent.toFixed(1)}%\n`;
      csv += `Campaign Duration,${tm.days} Days\n`;
      csv += `Daily Onboard Target,${tm.dailyOnboardTarget}\n`;
      csv += `Total Target (Tapped),${tm.totalTargetTapped}\n`;
      csv += `Cumulative Target (Seeded),${tm.target}\n`;
      csv += `Target Seeded Per Day,${tm.dailyTargetSeeded.toFixed(1)}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported "${name}" as CSV`);
  }

  function exportOneScenarioPNG(sc) {
    const tm = computeTrackerMetrics(sc.tracker);
    const name = sc.name || 'Untitled';
    const safeName = name.replace(/[^a-z0-9_-]/gi, '_');

    const dpr = window.devicePixelRatio || 2;
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 340;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Top gradient bar
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, '#7c3aed');
    grad.addColorStop(1, '#a855f7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, 5);

    // Brand
    ctx.font = '700 12px "Outfit", sans-serif';
    ctx.fillStyle = '#7c3aed';
    ctx.fillText('STAR DIGITAL AFFILIATE MARKETING', 32, 30);

    ctx.font = '800 20px "Outfit", sans-serif';
    ctx.fillStyle = '#190e2b';
    ctx.fillText(name, 32, 58);

    const dateStr = sc.timestamp ? new Date(sc.timestamp).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '';
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#6e6182';
    ctx.fillText(`Saved: ${dateStr}  •  Scope: ${sc.scope || 'all'}`, 32, 78);

    // KPI cards
    const kpis = [];
    if (sc.acceptance?.overall) {
      const rate = sc.acceptance.overall.tapped > 0 ? ((sc.acceptance.overall.onboarded / sc.acceptance.overall.tapped) * 100).toFixed(1) : '—';
      kpis.push({ label: 'Tapped Creators', value: sc.acceptance.overall.tapped.toLocaleString(), unit: '' });
      kpis.push({ label: 'Onboarded Creators', value: sc.acceptance.overall.onboarded.toLocaleString(), unit: '' });
      kpis.push({ label: 'Acceptance Rate', value: `${rate}%`, unit: '' });
    }
    if (tm) {
      kpis.push({ label: 'Conversion Rate', value: `${tm.ratePercent.toFixed(1)}%`, unit: '' });
      kpis.push({ label: 'Daily Onboard Target', value: tm.dailyOnboardTarget.toLocaleString(), unit: '/ day' });
      kpis.push({ label: `${tm.days}-Day Total (Tapped)`, value: tm.totalTargetTapped.toLocaleString(), unit: '' });
      kpis.push({ label: 'Cumulative (Seeded)', value: tm.target.toLocaleString(), unit: `/ ${tm.target.toLocaleString()}` });
      kpis.push({ label: 'Target Seeded / Day', value: tm.dailyTargetSeeded.toFixed(1), unit: '/ day', accent: true });
    }

    if (kpis.length === 0) {
      ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#8a7e9c';
      ctx.fillText('No metric data available for this scenario.', 32, 140);
    } else {
      const cardTop = 98;
      const cardH = 100;
      const cardGap = 10;
      const totalW = width - 64;
      const cols = Math.min(kpis.length, 5);
      const rows = Math.ceil(kpis.length / cols);
      const cardW = (totalW - cardGap * (cols - 1)) / cols;
      const kpiRadius = 8;

      kpis.forEach((kpi, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const kx = 32 + col * (cardW + cardGap);
        const ky = cardTop + row * (cardH + cardGap);

        ctx.fillStyle = kpi.accent ? '#f5f0ff' : '#faf9fe';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(kx, ky, cardW, cardH, kpiRadius) : ctx.rect(kx, ky, cardW, cardH);
        ctx.fill();

        ctx.strokeStyle = kpi.accent ? '#c4b5fd' : '#ede9fe';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(kx, ky, cardW, cardH, kpiRadius) : ctx.rect(kx, ky, cardW, cardH);
        ctx.stroke();

        ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#6e6182';
        ctx.textAlign = 'left';
        ctx.fillText(kpi.label, kx + 12, ky + 22);

        ctx.font = '700 20px "Outfit", sans-serif';
        ctx.fillStyle = kpi.accent ? '#7c3aed' : '#190e2b';
        ctx.fillText(kpi.value, kx + 12, ky + 58);

        if (kpi.unit) {
          ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#8a7e9c';
          ctx.fillText(kpi.unit, kx + 12, ky + 78);
        }
      });
      ctx.textAlign = 'left';
    }

    // Footer
    ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(`Star Digital Affiliate Marketing • Exported ${new Date().toLocaleDateString()}`, 32, height - 10);

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${safeName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Exported "${name}" as PNG`);
  }

  function exportOneScenarioPDF(sc) {
    const tm = computeTrackerMetrics(sc.tracker);
    const name = sc.name || 'Untitled';
    const dateStr = sc.timestamp ? new Date(sc.timestamp).toLocaleDateString(undefined, { dateStyle: 'full' }) : '';

    let kpiRows = '';
    if (sc.acceptance?.overall) {
      const rate = sc.acceptance.overall.tapped > 0 ? ((sc.acceptance.overall.onboarded / sc.acceptance.overall.tapped) * 100).toFixed(1) : '—';
      kpiRows += `<tr><td>Tapped Creators</td><td><strong>${sc.acceptance.overall.tapped.toLocaleString()}</strong></td></tr>`;
      kpiRows += `<tr><td>Onboarded Creators</td><td><strong>${sc.acceptance.overall.onboarded.toLocaleString()}</strong></td></tr>`;
      kpiRows += `<tr><td>Acceptance Rate</td><td><strong>${rate}%</strong></td></tr>`;
    }
    if (tm) {
      kpiRows += `<tr><td>Conversion Rate</td><td><strong>${tm.ratePercent.toFixed(1)}%</strong></td></tr>`;
      kpiRows += `<tr><td>Campaign Duration</td><td><strong>${tm.days} Days</strong></td></tr>`;
      kpiRows += `<tr><td>Daily Onboard Target</td><td><strong>${tm.dailyOnboardTarget.toLocaleString()} / day</strong></td></tr>`;
      kpiRows += `<tr><td>${tm.days}-Day Total Target (Tapped)</td><td><strong>${tm.totalTargetTapped.toLocaleString()}</strong></td></tr>`;
      kpiRows += `<tr><td>Cumulative Target (Seeded)</td><td><strong>${tm.target.toLocaleString()}</strong></td></tr>`;
      kpiRows += `<tr class="accent-row"><td>Target Seeded / Day</td><td><strong>${tm.dailyTargetSeeded.toFixed(1)} / day</strong></td></tr>`;
    }

    const printWin = window.open('', '_blank');
    if (!printWin) { showToast('Pop-up blocked. Please allow pop-ups for PDF export.', 'error'); return; }

    printWin.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>${escapeHtml(name)} – Scenario Report</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; color: #190e2b; background: #fff; padding: 36px 40px; }
        .header { border-bottom: 3px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
        .brand { font-size: 12px; font-weight: 700; color: #7c3aed; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'Outfit', sans-serif; }
        .title { font-size: 24px; font-weight: 800; color: #190e2b; margin: 6px 0; font-family: 'Outfit', sans-serif; }
        .meta { font-size: 12px; color: #6e6182; }
        table { width: 480px; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
        th { background: #f5f3ff; color: #581c87; font-weight: 700; text-align: left; padding: 10px 14px; border-bottom: 2px solid #ddd6fe; }
        td { padding: 12px 14px; border-bottom: 1px solid #f1ecf9; }
        td:first-child { color: #5e5173; }
        .accent-row td { background: #f5f0ff; }
        .accent-row td strong { color: #7c3aed; }
        .footer { margin-top: 32px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e9d5ff; padding-top: 14px; }
        @media print { body { padding: 0; } @page { margin: 1cm; } }
      </style>
    </head><body>
      <div class="header">
        <div class="brand">Star Digital Affiliate Marketing</div>
        <div class="title">${escapeHtml(name)}</div>
        <div class="meta">Saved: ${dateStr} &bull; Scope: ${sc.scope || 'all'}</div>
      </div>
      <table>
        <thead><tr><th>Metric</th><th>Value</th></tr></thead>
        <tbody>${kpiRows}</tbody>
      </table>
      <div class="footer">Star Digital Affiliate Marketing &bull; Creator Seeding Onboarding Target Tracker SDS</div>
      <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };<\/script>
    </body></html>`);
    printWin.document.close();
    showToast(`Opening PDF for "${name}"...`);
  }

  // --- Metric Calculator Helper for Tracker Scenarios ---
  function computeTrackerMetrics(tracker) {
    if (!tracker) return null;
    const target = Math.max(1, Math.round(Number(tracker.cumulativeTarget) || 500));
    const baseline = Math.max(0, Math.round(Number(tracker.baselineSeeded) || 0));
    const ratePercent = Math.max(0.1, Math.min(100, Number(tracker.conversionRate) || 35.0));
    const rateDecimal = ratePercent / 100.0;
    const days = Math.max(1, Math.min(60, Math.round(Number(tracker.campaignDays) || 5)));
    const neededSeeded = Math.max(0, target - baseline);
    const totalOnboardTarget = Math.ceil(neededSeeded / rateDecimal);
    const dailyOnboardTarget = Math.ceil(totalOnboardTarget / days);
    const normalizedTotalTarget = dailyOnboardTarget * days;
    const dailyTargetSeeded = dailyOnboardTarget * rateDecimal;

    return {
      target,
      baseline,
      ratePercent,
      days,
      dailyOnboardTarget,
      totalTargetTapped: normalizedTotalTarget,
      dailyTargetSeeded
    };
  }

  // --- Export Saved Scenarios (CSV, PNG, PDF) ---
  function exportScenariosCSV() {
    const list = StarDigitalStore.getSavedScenarios();
    if (!list || list.length === 0) {
      showToast('No saved scenarios to export.', 'error');
      return;
    }

    let csv = 'Scenario Name,Scope,Created Date,Tapped Creators,Onboarded Creators,Acceptance Rate (%),Conversion Rate (%),Daily Onboard Target,Total Target (Tapped),Cumulative Target (Seeded),Target Seeded Per Day,Campaign Duration (Days)\n';

    list.forEach(sc => {
      const name = `"${(sc.name || 'Untitled').replace(/"/g, '""')}"`;
      const scope = `"${sc.scope || 'all'}"`;
      const date = `"${sc.timestamp ? new Date(sc.timestamp).toLocaleString() : ''}"`;
      const tapped = sc.acceptance?.overall?.tapped ?? '';
      const onboarded = sc.acceptance?.overall?.onboarded ?? '';
      const acceptRate = (tapped && Number(tapped) > 0) ? ((Number(onboarded) / Number(tapped)) * 100).toFixed(1) : '';

      const tm = computeTrackerMetrics(sc.tracker);
      const convRate = tm ? `${tm.ratePercent.toFixed(1)}%` : '';
      const dailyOnboard = tm ? tm.dailyOnboardTarget : '';
      const totalTapped = tm ? tm.totalTargetTapped : '';
      const cumulativeSeeded = tm ? tm.target : '';
      const targetSeededDay = tm ? tm.dailyTargetSeeded.toFixed(1) : '';
      const days = tm ? `${tm.days} Days` : '';

      csv += `${name},${scope},${date},${tapped},${onboarded},${acceptRate},${convRate},${dailyOnboard},${totalTapped},${cumulativeSeeded},${targetSeededDay},${days}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Star-Digital-Saved-Scenarios-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${list.length} scenario(s) to CSV`);
  }

  function exportScenariosPNG() {
    const list = StarDigitalStore.getSavedScenarios();
    if (!list || list.length === 0) {
      showToast('No saved scenarios to export.', 'error');
      return;
    }

    const dpr = window.devicePixelRatio || 2;
    const canvas = document.createElement('canvas');
    const width = 1180;
    const rowHeight = 84;
    const headerHeight = 145;
    const footerHeight = 65;
    const height = headerHeight + list.length * rowHeight + footerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Background gradient / crisp canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Header banner top border
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#7c3aed');
    gradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, 6);

    // Brand Title & Info
    ctx.fillStyle = '#7c3aed';
    ctx.font = '700 13px "Outfit", sans-serif';
    ctx.fillText('STAR DIGITAL AFFILIATE MARKETING', 36, 42);

    ctx.fillStyle = '#190e2b';
    ctx.font = '800 24px "Outfit", sans-serif';
    ctx.fillText('Saved Campaign Scenarios Summary', 36, 74);

    ctx.fillStyle = '#6e6182';
    ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Exported on ${new Date().toLocaleDateString(undefined, { dateStyle: 'full' })} \u2022 Total Scenarios: ${list.length} \u2022 Complete Seeding & Onboarding Metrics`, 36, 98);

    // Table Header Row
    const tableTop = 120;
    ctx.fillStyle = '#f8f6fc';
    ctx.fillRect(24, tableTop, width - 48, 38);

    ctx.fillStyle = '#581c87';
    ctx.font = '700 11.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SCENARIO NAME', 38, tableTop + 24);
    ctx.fillText('SCOPE', 280, tableTop + 24);
    ctx.fillText('CONVERSION', 410, tableTop + 24);
    ctx.fillText('DAILY ONBOARD', 525, tableTop + 24);
    ctx.fillText('TOTAL (TAPPED)', 655, tableTop + 24);
    ctx.fillText('CUMULATIVE (SEEDED)', 785, tableTop + 24);
    ctx.fillText('TARGET SEEDED/DAY', 945, tableTop + 24);

    // Render Scenario Rows
    let currentY = tableTop + 38;
    list.forEach((sc, idx) => {
      // Alternating row background
      if (idx % 2 === 1) {
        ctx.fillStyle = '#faf8fe';
        ctx.fillRect(24, currentY, width - 48, rowHeight);
      }

      // Divider line
      ctx.strokeStyle = '#f1ecf9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, currentY + rowHeight);
      ctx.lineTo(width - 24, currentY + rowHeight);
      ctx.stroke();

      // Scenario Name & Date
      ctx.fillStyle = '#190e2b';
      ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
      const displayName = sc.name && sc.name.length > 28 ? sc.name.substring(0, 26) + '...' : (sc.name || 'Untitled');
      ctx.fillText(displayName, 38, currentY + 32);

      const dateStr = sc.timestamp ? new Date(sc.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      ctx.fillStyle = '#8a7e9c';
      ctx.font = '500 11.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(dateStr, 38, currentY + 54);

      // Scope Pill
      let scopeLabel = 'All (Continuous)';
      let pillBg = '#ede9fe';
      let pillColor = '#6d28d9';
      if (sc.scope === 'acceptance_only') {
        scopeLabel = 'Acceptance';
        pillBg = '#d1fae5';
        pillColor = '#065f46';
      } else if (sc.scope === 'tracker_only') {
        scopeLabel = 'Tracker Only';
        pillBg = '#fef3c7';
        pillColor = '#92400e';
      }

      ctx.fillStyle = pillBg;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(280, currentY + 24, 105, 26, 13) : ctx.rect(280, currentY + 24, 105, 26);
      ctx.fill();

      ctx.fillStyle = pillColor;
      ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(scopeLabel, 292, currentY + 41);

      // Metrics computation
      const tm = computeTrackerMetrics(sc.tracker);

      // Conversion Rate
      ctx.fillStyle = '#190e2b';
      ctx.font = '700 14px "Outfit", sans-serif';
      if (tm) {
        ctx.fillText(`${tm.ratePercent.toFixed(1)}%`, 410, currentY + 38);
      } else if (sc.acceptance?.overall && sc.acceptance.overall.tapped > 0) {
        const acceptRate = ((sc.acceptance.overall.onboarded / sc.acceptance.overall.tapped) * 100).toFixed(1);
        ctx.fillText(`${acceptRate}%`, 410, currentY + 38);
      } else {
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('\u2014', 410, currentY + 38);
      }

      // Daily Onboard Target
      ctx.fillStyle = '#190e2b';
      ctx.font = '700 14px "Outfit", sans-serif';
      if (tm) {
        ctx.fillText(`${tm.dailyOnboardTarget.toLocaleString()} /day`, 525, currentY + 38);
      } else {
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('\u2014', 525, currentY + 38);
      }

      // Total Target (Tapped)
      ctx.fillStyle = '#190e2b';
      ctx.font = '700 14px "Outfit", sans-serif';
      if (tm) {
        ctx.fillText(`${tm.totalTargetTapped.toLocaleString()}`, 655, currentY + 38);
        ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#8a7e9c';
        ctx.fillText(`(${tm.days}-day flight)`, 655, currentY + 54);
      } else if (sc.acceptance?.overall) {
        ctx.fillText(`${sc.acceptance.overall.tapped.toLocaleString()}`, 655, currentY + 38);
      } else {
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('\u2014', 655, currentY + 38);
      }

      // Cumulative Target (Seeded)
      ctx.fillStyle = '#190e2b';
      ctx.font = '700 14px "Outfit", sans-serif';
      if (tm) {
        ctx.fillText(`${tm.target.toLocaleString()}`, 785, currentY + 38);
        ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#8a7e9c';
        ctx.fillText(`seeded goal`, 785, currentY + 54);
      } else if (sc.acceptance?.overall) {
        ctx.fillText(`${sc.acceptance.overall.onboarded.toLocaleString()}`, 785, currentY + 38);
      } else {
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('\u2014', 785, currentY + 38);
      }

      // Target Seeded Per Day
      ctx.fillStyle = '#7c3aed';
      ctx.font = '700 14px "Outfit", sans-serif';
      if (tm) {
        ctx.fillText(`${tm.dailyTargetSeeded.toFixed(1)} /day`, 945, currentY + 38);
      } else {
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('\u2014', 945, currentY + 38);
      }

      currentY += rowHeight;
    });

    // Footer
    ctx.fillStyle = '#8a7e9c';
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Star Digital Affiliate Marketing \u2022 Official Onboarding Calculator and Target Tracker Export', 36, height - 24);

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Star-Digital-Saved-Scenarios-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Exported ${list.length} scenario(s) as PNG Image`);
  }

  function exportScenariosPDF() {
    const list = StarDigitalStore.getSavedScenarios();
    if (!list || list.length === 0) {
      showToast('No saved scenarios to export.', 'error');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Pop-up blocked. Please allow pop-ups to export PDF.', 'error');
      return;
    }

    let rowsHtml = '';
    list.forEach(sc => {
      const dateStr = sc.timestamp ? new Date(sc.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      let scopePill = '<span class="badge badge-purple">All (Continuous)</span>';
      if (sc.scope === 'acceptance_only') scopePill = '<span class="badge badge-emerald">Acceptance</span>';
      if (sc.scope === 'tracker_only') scopePill = '<span class="badge badge-yellow">Tracker Only</span>';

      const tm = computeTrackerMetrics(sc.tracker);
      const convRate = tm ? `<strong>${tm.ratePercent.toFixed(1)}%</strong>` : (sc.acceptance?.overall && sc.acceptance.overall.tapped > 0 ? `<strong>${((sc.acceptance.overall.onboarded / sc.acceptance.overall.tapped) * 100).toFixed(1)}%</strong>` : '&mdash;');
      const dailyOnboard = tm ? `<strong>${tm.dailyOnboardTarget.toLocaleString()}</strong> /day` : '&mdash;';
      const totalTapped = tm ? `<strong>${tm.totalTargetTapped.toLocaleString()}</strong> <small style="color:#6e6182">(${tm.days}d)</small>` : (sc.acceptance?.overall ? `<strong>${sc.acceptance.overall.tapped.toLocaleString()}</strong>` : '&mdash;');
      const cumulativeSeeded = tm ? `<strong>${tm.target.toLocaleString()}</strong>` : (sc.acceptance?.overall ? `<strong>${sc.acceptance.overall.onboarded.toLocaleString()}</strong>` : '&mdash;');
      const seededPerDay = tm ? `<strong style="color: #7c3aed">${tm.dailyTargetSeeded.toFixed(1)}</strong> /day` : '&mdash;';

      rowsHtml += `
        <tr>
          <td>
            <div class="sc-title">${escapeHtml(sc.name || 'Untitled Scenario')}</div>
            <div class="sc-date">${dateStr}</div>
          </td>
          <td>${scopePill}</td>
          <td>${convRate}</td>
          <td>${dailyOnboard}</td>
          <td>${totalTapped}</td>
          <td>${cumulativeSeeded}</td>
          <td>${seededPerDay}</td>
        </tr>
      `;
    });

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Star Digital Affiliate Marketing - Saved Scenarios Report</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Plus Jakarta Sans', sans-serif; color: #190e2b; background: #ffffff; padding: 36px 40px; }
          .header { border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 24px; }
          .brand-title { font-size: 13px; font-weight: 700; color: #7c3aed; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'Outfit', sans-serif; }
          .report-title { font-size: 26px; font-weight: 800; color: #190e2b; margin: 6px 0; font-family: 'Outfit', sans-serif; }
          .report-meta { font-size: 13px; color: #6e6182; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12.5px; }
          th { background: #f5f3ff; color: #581c87; font-weight: 700; text-align: left; padding: 11px 12px; font-size: 11.5px; border-bottom: 2px solid #ddd6fe; }
          td { padding: 13px 12px; border-bottom: 1px solid #f1ecf9; vertical-align: middle; }
          .sc-title { font-weight: 700; font-size: 13.5px; color: #190e2b; }
          .sc-date { font-size: 11px; color: #8a7e9c; margin-top: 2px; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10.5px; font-weight: 700; }
          .badge-purple { background: #ede9fe; color: #6d28d9; }
          .badge-emerald { background: #d1fae5; color: #065f46; }
          .badge-yellow { background: #fef3c7; color: #92400e; }
          .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e9d5ff; font-size: 12px; color: #8a7e9c; display: flex; justify-content: space-between; }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; size: landscape; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-title">Star Digital Affiliate Marketing</div>
          <h1 class="report-title">Saved Campaign Scenarios Report</h1>
          <div class="report-meta">Generated on ${new Date().toLocaleDateString(undefined, { dateStyle: 'full' })} &bull; Total Scenarios: ${list.length}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 22%;">Scenario Name</th>
              <th style="width: 12%;">Scope</th>
              <th style="width: 12%;">Conversion Rate</th>
              <th style="width: 14%;">Daily Onboard Target</th>
              <th style="width: 14%;">Total Target (Tapped)</th>
              <th style="width: 13%;">Cumulative (Seeded)</th>
              <th style="width: 13%;">Target Seeded / Day</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="footer">
          <span>Star Digital Affiliate Marketing &bull; Creator Seeding Onboarding Target Tracker SDS</span>
          <span>Confidential Planning Document</span>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    showToast('Opening PDF Print Preview...');
  }

  function setupEvents() {
    // Campaign name input changes
    elements.campaignNameInput.addEventListener('input', syncCampaignName);

    // Start workflow button (moves to Step 1: Acceptance Rate Calculator)
    elements.btnStartWorkflow.addEventListener('click', () => {
      syncCampaignName();
      window.location.href = 'acceptance-rate.html';
    });

    // Links also sync before navigation
    elements.linkToAcceptance.addEventListener('click', syncCampaignName);
    elements.linkToTracker.addEventListener('click', syncCampaignName);

    // Scenarios Modal
    elements.btnOpenHomeScenarios.addEventListener('click', () => {
      renderScenarioList();
      elements.homeScenarioModal.classList.add('open');
    });

    elements.closeHomeScenarioModalBtn.addEventListener('click', () => {
      elements.homeScenarioModal.classList.remove('open');
    });

    elements.btnHomeSaveNewScenario.addEventListener('click', () => {
      elements.homeScenarioModal.classList.remove('open');
      promptSaveNew();
    });

    // Export Scenarios Dropdown & Handlers
    if (elements.btnExportScenariosMenu) {
      elements.btnExportScenariosMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.homeExportDropdownContainer?.classList.toggle('open');
      });
    }

    if (elements.exportScenariosCsvBtn) {
      elements.exportScenariosCsvBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.homeExportDropdownContainer?.classList.remove('open');
        exportScenariosCSV();
      });
    }

    if (elements.exportScenariosPngBtn) {
      elements.exportScenariosPngBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.homeExportDropdownContainer?.classList.remove('open');
        exportScenariosPNG();
      });
    }

    if (elements.exportScenariosPdfBtn) {
      elements.exportScenariosPdfBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.homeExportDropdownContainer?.classList.remove('open');
        exportScenariosPDF();
      });
    }

    // Close export dropdown when clicking elsewhere
    document.addEventListener('click', () => {
      elements.homeExportDropdownContainer?.classList.remove('open');
    });

    // Granular Save Modal
    elements.closeGranularSaveBtn.addEventListener('click', () => {
      elements.granularSaveModal.classList.remove('open');
    });

    elements.cancelGranularSaveBtn.addEventListener('click', () => {
      elements.granularSaveModal.classList.remove('open');
    });

    elements.confirmGranularSaveBtn.addEventListener('click', confirmSave);

    // Close on backdrop click
    [elements.homeScenarioModal, elements.granularSaveModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        elements.homeScenarioModal.classList.remove('open');
        elements.granularSaveModal.classList.remove('open');
      }
    });
  }

  function init() {
    const savedName = StarDigitalStore.getActiveCampaignName();
    if (savedName) {
      elements.campaignNameInput.value = savedName;
    }
    updateScenarioCount();
    setupEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
