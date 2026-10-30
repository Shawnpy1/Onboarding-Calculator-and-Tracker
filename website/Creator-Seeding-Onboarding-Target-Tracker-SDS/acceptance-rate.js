/**
 * Star Digital Affiliate Marketing
 * Campaign Acceptance Rate Calculator Logic
 * Real-time overall computation, Multi-Duration Analytics, and Seamless Continuous Handoff
 */

(() => {
  'use strict';

  // State
  let overallState = {
    tapped: 300,
    onboarded: 105
  };

  let periods = [];

  // DOM Elements
  const el = {
    activeCampaignTag: document.getElementById('activeCampaignTag'),
    overallTappedInput: document.getElementById('overallTappedInput'),
    overallOnboardedInput: document.getElementById('overallOnboardedInput'),
    computedRateBig: document.getElementById('computedRateBig'),
    acceptanceProgressBar: document.getElementById('acceptanceProgressBar'),
    computedMathFormula: document.getElementById('computedMathFormula'),
    kpiAcceptanceRate: document.getElementById('kpiAcceptanceRate'),
    kpiAcceptanceSub: document.getElementById('kpiAcceptanceSub'),
    kpiTappedDisplay: document.getElementById('kpiTappedDisplay'),
    kpiOnboardedDisplay: document.getElementById('kpiOnboardedDisplay'),
    kpiBenchmarkStatus: document.getElementById('kpiBenchmarkStatus'),
    kpiBenchmarkSub: document.getElementById('kpiBenchmarkSub'),

    // Duration Form & Table
    addDurationForm: document.getElementById('addDurationForm'),
    durationLabelInput: document.getElementById('durationLabelInput'),
    durationTappedInput: document.getElementById('durationTappedInput'),
    durationOnboardedInput: document.getElementById('durationOnboardedInput'),
    durationTableBody: document.getElementById('durationTableBody'),
    durationTabs: document.querySelectorAll('.duration-tab-btn'),

    // Templates, Handoff & Save
    btnLoadWeeklyTemplate: document.getElementById('btnLoadWeeklyTemplate'),
    btnLoadMonthlyTemplate: document.getElementById('btnLoadMonthlyTemplate'),
    btnClearDurations: document.getElementById('btnClearDurations'),
    btnExportDurationsCsv: document.getElementById('btnExportDurationsCsv'),
    btnHandoffToTracker: document.getElementById('btnHandoffToTracker'),
    btnSaveAcceptanceScenario: document.getElementById('btnSaveAcceptanceScenario'),

    // Modal
    acceptanceSaveModal: document.getElementById('acceptanceSaveModal'),
    accSaveScenarioName: document.getElementById('accSaveScenarioName'),
    closeAcceptanceSaveBtn: document.getElementById('closeAcceptanceSaveBtn'),
    cancelAcceptanceSaveBtn: document.getElementById('cancelAcceptanceSaveBtn'),
    confirmAcceptanceSaveBtn: document.getElementById('confirmAcceptanceSaveBtn'),

    toastContainer: document.getElementById('toastContainer')
  };

  // --- Helpers & Storage Sync ---
  function loadState() {
    overallState = StarDigitalStore.getAcceptanceOverall();
    periods = StarDigitalStore.getAcceptancePeriods();

    if (el.activeCampaignTag) {
      el.activeCampaignTag.textContent = StarDigitalStore.getActiveCampaignName();
    }
  }

  function saveCurrentState() {
    StarDigitalStore.setAcceptanceOverall(overallState);
    StarDigitalStore.setAcceptancePeriods(periods);
  }

  function showToast(message, type = 'info') {
    if (!el.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <span>${message}</span>
      </div>
    `;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // --- Calculations ---
  function computeRate(onboarded, tapped) {
    if (!tapped || tapped <= 0) return 0;
    return (onboarded / tapped) * 100;
  }

  function getBenchmarkBadge(rate) {
    if (rate >= 35) {
      return { text: 'High-Yield (35%+)', className: 'badge-emerald', sub: 'Top-quartile creator traction' };
    } else if (rate >= 20) {
      return { text: 'Healthy Baseline (20% - 35%)', className: 'badge-purple', sub: 'Industry standard for seeding' };
    } else if (rate > 0) {
      return { text: 'Needs Boost (<20%)', className: 'badge-rose', sub: 'Friction / follow-up bottleneck' };
    } else {
      return { text: 'Ready for Inputs', className: 'badge-gray', sub: 'Enter tapped & onboarded numbers' };
    }
  }

  // --- Render Overall Engine ---
  function renderOverall() {
    const tapped = Math.max(0, parseInt(el.overallTappedInput.value, 10) || 0);
    const onboarded = Math.max(0, parseInt(el.overallOnboardedInput.value, 10) || 0);

    overallState.tapped = tapped;
    overallState.onboarded = onboarded;
    saveCurrentState();

    const rate = computeRate(onboarded, tapped);
    const rateFormatted = rate.toFixed(1);

    // KPI Cards
    el.kpiAcceptanceRate.textContent = `${rateFormatted}%`;
    el.kpiTappedDisplay.textContent = tapped.toLocaleString();
    el.kpiOnboardedDisplay.textContent = onboarded.toLocaleString();
    el.kpiAcceptanceSub.textContent = `${onboarded} onboarded of ${tapped} tapped`;

    const benchmark = getBenchmarkBadge(rate);
    el.kpiBenchmarkStatus.textContent = benchmark.text;
    el.kpiBenchmarkStatus.className = `kpi-value badge-pill ${benchmark.className}`;
    el.kpiBenchmarkSub.textContent = benchmark.sub;

    // Output Box
    el.computedRateBig.textContent = rateFormatted;
    const progressWidth = Math.min(100, Math.max(0, rate));
    el.acceptanceProgressBar.style.width = `${progressWidth}%`;
    el.computedMathFormula.innerHTML = `<strong>${onboarded.toLocaleString()}</strong> onboarded &divide; <strong>${tapped.toLocaleString()}</strong> tapped = <strong>${rateFormatted}%</strong> acceptance yield`;
  }

  // --- Render Duration Table ---
  function renderPeriodsTable() {
    el.durationTableBody.innerHTML = '';

    if (periods.length === 0) {
      el.durationTableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="7" class="text-center py-6 text-muted">
            No specific duration periods added yet. Use the form above to log weekly, monthly, or custom duration sprints.
          </td>
        </tr>
      `;
      return;
    }

    periods.forEach((p, index) => {
      const rate = computeRate(p.onboarded, p.tapped);
      const rateFormatted = rate.toFixed(1);
      const benchmark = getBenchmarkBadge(rate);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="period-title-cell">
            <span class="period-type-badge">${escapeHtml(p.type || 'Custom')}</span>
            <strong class="period-name">${escapeHtml(p.label)}</strong>
          </div>
        </td>
        <td><span class="metric-num">${p.tapped.toLocaleString()}</span></td>
        <td><span class="metric-num">${p.onboarded.toLocaleString()}</span></td>
        <td>
          <span class="rate-highlight">${rateFormatted}%</span>
        </td>
        <td>
          <span class="status-pill ${benchmark.className}">${benchmark.text}</span>
        </td>
        <td>
          <div class="table-bar-shell" title="${rateFormatted}%">
            <div class="table-bar-fill" style="width: ${Math.min(100, rate)}%"></div>
          </div>
        </td>
        <td class="text-right">
          <div class="action-btn-group">
            <button class="btn-icon delete-btn" data-index="${index}" title="Remove this duration period">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;
      el.durationTableBody.appendChild(tr);
    });

    // Attach delete handlers
    el.durationTableBody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const removed = periods.splice(idx, 1);
        saveCurrentState();
        renderPeriodsTable();
        showToast(`Removed period: ${removed[0]?.label || ''}`);
      });
    });
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

  // --- Export Durations to CSV ---
  function exportDurationsCSV() {
    if (periods.length === 0) {
      showToast('No duration periods to export.', 'warning');
      return;
    }

    let csv = 'Period Label,Period Type,Creators Tapped,Creators Onboarded,Acceptance Rate (%),Benchmark Status\r\n';
    periods.forEach(p => {
      const rate = computeRate(p.onboarded, p.tapped).toFixed(2);
      const bench = getBenchmarkBadge(parseFloat(rate)).text;
      const cleanLabel = `"${p.label.replace(/"/g, '""')}"`;
      csv += `${cleanLabel},${p.type || 'Custom'},${p.tapped},${p.onboarded},${rate}%,${bench}\r\n`;
    });

    const overallRate = computeRate(overallState.onboarded, overallState.tapped).toFixed(2);
    csv += `\r\n"Overall Campaign Total",Aggregate,${overallState.tapped},${overallState.onboarded},${overallRate}%,${getBenchmarkBadge(parseFloat(overallRate)).text}\r\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Star_Digital_Acceptance_Rates_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported acceptance data to CSV!');
  }

  // --- Transfer To Target Tracker (Continuous Process) ---
  function transferToTracker() {
    saveCurrentState();
    const rate = computeRate(overallState.onboarded, overallState.tapped);
    const validRate = rate > 0 ? parseFloat(rate.toFixed(1)) : 35.0;

    // Load current tracker state, update conversionRate and scenarioName
    const trackerState = StarDigitalStore.getTrackerState();
    trackerState.conversionRate = validRate;
    trackerState.scenarioName = StarDigitalStore.getActiveCampaignName();
    StarDigitalStore.setTrackerState(trackerState);

    showToast(`Carrying ${validRate}% conversion rate to Target Tracker...`);
    setTimeout(() => {
      window.location.href = 'tracker.html';
    }, 400);
  }

  // --- Event Setup ---
  function setupEvents() {
    el.overallTappedInput.addEventListener('input', renderOverall);
    el.overallOnboardedInput.addEventListener('input', renderOverall);

    // Presets
    document.querySelectorAll('.tapped-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        el.overallTappedInput.value = btn.getAttribute('data-val');
        renderOverall();
      });
    });

    document.querySelectorAll('.onboarded-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        el.overallOnboardedInput.value = btn.getAttribute('data-val');
        renderOverall();
      });
    });

    // Form submission
    el.addDurationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const label = el.durationLabelInput.value.trim();
      const tapped = parseInt(el.durationTappedInput.value, 10);
      const onboarded = parseInt(el.durationOnboardedInput.value, 10);

      if (!label || isNaN(tapped) || isNaN(onboarded)) {
        showToast('Please enter a valid period name, tapped, and onboarded counts.', 'warning');
        return;
      }

      const activeTab = document.querySelector('.duration-tab-btn.active');
      const periodType = activeTab ? activeTab.getAttribute('data-period-type') : 'custom';

      periods.push({
        id: 'period_' + Date.now(),
        label,
        tapped,
        onboarded,
        type: periodType.toUpperCase()
      });

      saveCurrentState();
      renderPeriodsTable();

      el.durationLabelInput.value = `Week ${periods.length + 1}`;
      el.durationTappedInput.value = '100';
      el.durationOnboardedInput.value = '35';
      showToast(`Added "${label}" to duration tracking!`);
    });

    // Tabs
    el.durationTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        el.durationTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const type = tab.getAttribute('data-period-type');
        if (type === 'week') {
          el.durationLabelInput.value = `Week ${periods.length + 1}`;
        } else if (type === 'month') {
          el.durationLabelInput.value = `Month ${periods.length + 1}`;
        } else {
          el.durationLabelInput.value = 'Sprint Flight Alpha';
        }
      });
    });

    // Templates
    el.btnLoadWeeklyTemplate.addEventListener('click', () => {
      periods = [
        { id: 'w1', label: 'Week 1: Initial Discovery', tapped: 100, onboarded: 28, type: 'WEEK' },
        { id: 'w2', label: 'Week 2: Direct Creator Messaging', tapped: 150, onboarded: 52, type: 'WEEK' },
        { id: 'w3', label: 'Week 3: High-Follower Retargeting', tapped: 130, onboarded: 48, type: 'WEEK' },
        { id: 'w4', label: 'Week 4: Final Closing Cohort', tapped: 120, onboarded: 46, type: 'WEEK' }
      ];
      saveCurrentState();
      renderPeriodsTable();
      showToast('Loaded 4-Week Campaign Template!');
    });

    el.btnLoadMonthlyTemplate.addEventListener('click', () => {
      periods = [
        { id: 'm1', label: 'Month 1: Foundation & Seeding Ramp', tapped: 400, onboarded: 130, type: 'MONTH' },
        { id: 'm2', label: 'Month 2: Mid-Campaign Scale', tapped: 550, onboarded: 205, type: 'MONTH' },
        { id: 'm3', label: 'Month 3: Optimization & VIP Affiliates', tapped: 480, onboarded: 195, type: 'MONTH' }
      ];
      saveCurrentCurrentDurations:
      saveCurrentState();
      renderPeriodsTable();
      showToast('Loaded 3-Month Campaign Template!');
    });

    el.btnClearDurations.addEventListener('click', () => {
      if (confirm('Clear all custom duration periods from the table?')) {
        periods = [];
        saveCurrentState();
        renderPeriodsTable();
        showToast('Cleared all duration periods.');
      }
    });

    el.btnExportDurationsCsv.addEventListener('click', exportDurationsCSV);

    // Continuous Transfer Button
    el.btnHandoffToTracker.addEventListener('click', transferToTracker);

    // Granular Save Modal
    el.btnSaveAcceptanceScenario.addEventListener('click', () => {
      el.accSaveScenarioName.value = StarDigitalStore.getActiveCampaignName();
      el.acceptanceSaveModal.classList.add('open');
      el.accSaveScenarioName.focus();
    });

    el.closeAcceptanceSaveBtn.addEventListener('click', () => {
      el.acceptanceSaveModal.classList.remove('open');
    });

    el.cancelAcceptanceSaveBtn.addEventListener('click', () => {
      el.acceptanceSaveModal.classList.remove('open');
    });

    el.confirmAcceptanceSaveBtn.addEventListener('click', () => {
      const name = el.accSaveScenarioName.value.trim() || StarDigitalStore.getActiveCampaignName();
      const scope = document.querySelector('input[name="accSaveScope"]:checked')?.value || 'all';

      StarDigitalStore.addSavedScenario({
        name,
        scope,
        acceptanceData: {
          overall: { ...overallState },
          periods: [...periods]
        }
      });

      el.acceptanceSaveModal.classList.remove('open');
      showToast(`Saved scenario "${name}" (${scope === 'all' ? 'All Continuous' : 'Acceptance Only'})!`);
    });

    [el.acceptanceSaveModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') el.acceptanceSaveModal.classList.remove('open');
    });
  }

  // --- Init ---
  function init() {
    loadState();
    el.overallTappedInput.value = overallState.tapped;
    el.overallOnboardedInput.value = overallState.onboarded;

    setupEvents();
    renderOverall();
    renderPeriodsTable();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
