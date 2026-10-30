/**
 * Creator Seeding & Onboarding Target Tracker
 * Complete Interactive Application Logic & Dual-Axis Canvas Renderer
 * Purple Theme Edition with Customizable Scenario Naming
 */

(() => {
  'use strict';

  // --- Initial Default State ---
  const DEFAULT_STATE = {
    scenarioName: 'Star Digital Campaign (500 Goal @ 35%)',
    cumulativeTarget: 500,
    conversionRate: 35.0,
    baselineSeeded: 0,
    campaignDays: 5
  };

  // Active working state
  let state = { ...DEFAULT_STATE };

  // Empty default scenarios list (starts completely clean)
  const PRESET_SCENARIOS = [];

  // DOM Elements
  const elements = {
    displaySubtitle: document.getElementById('displaySubtitle'),
    kpiConversionRate: document.getElementById('kpiConversionRate'),
    kpiDailyTarget: document.getElementById('kpiDailyTarget'),
    kpiTotalTarget: document.getElementById('kpiTotalTarget'),
    kpiTotalTargetLabel: document.getElementById('kpiTotalTargetLabel'),
    kpiCumulativeTarget: document.getElementById('kpiCumulativeTarget'),
    kpiCumulativeDenominator: document.getElementById('kpiCumulativeDenominator'),
    kpiTargetSeededPerDay: document.getElementById('kpiTargetSeededPerDay'),
    legendGoalText: document.getElementById('legendGoalText'),

    // Sliders & Direct Inputs
    conversionSlider: document.getElementById('conversionSlider'),
    conversionNumberInput: document.getElementById('conversionNumberInput'),
    cumulativeTargetInput: document.getElementById('cumulativeTargetInput'),
    baselineInput: document.getElementById('baselineInput'),
    campaignDaysSelect: document.getElementById('campaignDaysSelect'),
    customDaysInput: document.getElementById('customDaysInput'),
    scenarioNameDirectInput: document.getElementById('scenarioNameDirectInput'),
    btnQuickSaveName: document.getElementById('btnQuickSaveName'),

    // Canvas
    trackerChart: document.getElementById('trackerChart'),
    chartTooltip: document.getElementById('chartTooltip'),

    // Export & Dropdown
    btnExportMenu: document.getElementById('btnExportMenu'),
    exportDropdown: document.getElementById('exportDropdown'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    exportPngBtn: document.getElementById('exportPngBtn'),
    copyClipboardBtn: document.getElementById('copyClipboardBtn'),
    printReportBtn: document.getElementById('printReportBtn'),

    // Scenarios & Modals
    savedScenarioCount: document.getElementById('savedScenarioCount'),
    btnOpenScenarioModal: document.getElementById('btnOpenScenarioModal'),
    btnSaveCurrentScenario: document.getElementById('btnSaveCurrentScenario'),
    scenarioModal: document.getElementById('scenarioModal'),
    closeScenarioModalBtn: document.getElementById('closeScenarioModalBtn'),
    btnModalSaveNew: document.getElementById('btnModalSaveNew'),
    scenarioListContainer: document.getElementById('scenarioListContainer'),

    // Name Prompt Modal
    namePromptModal: document.getElementById('namePromptModal'),
    namePromptModalTitle: document.getElementById('namePromptModalTitle'),
    scenarioNameInput: document.getElementById('scenarioNameInput'),
    confirmSaveScenarioBtn: document.getElementById('confirmSaveScenarioBtn'),
    cancelSaveScenarioBtn: document.getElementById('cancelSaveScenarioBtn'),
    closeNamePromptBtn: document.getElementById('closeNamePromptBtn'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // Modal Editing Mode
  let editingScenarioId = null;

  // --- Scenario Management via StarDigitalStore ---
  function getStoredScenarios() {
    if (typeof StarDigitalStore !== 'undefined') {
      return StarDigitalStore.getSavedScenarios();
    }
    return [];
  }

  function saveStoredScenarios(scenarios) {
    if (typeof StarDigitalStore !== 'undefined') {
      StarDigitalStore.saveSavedScenarios(scenarios);
      updateScenarioCount();
    }
  }

  function updateScenarioCount() {
    const list = getStoredScenarios();
    if (elements.savedScenarioCount) {
      elements.savedScenarioCount.textContent = list.length;
    }
  }

  // --- Core Mathematical Calculation Engine ---
  function calculateModel() {
    const target = Math.max(1, Math.round(Number(state.cumulativeTarget) || 500));
    const baseline = Math.max(0, Math.round(Number(state.baselineSeeded) || 0));
    const ratePercent = Math.max(0.1, Math.min(100, Number(state.conversionRate) || 35.0));
    const rateDecimal = ratePercent / 100.0;
    const days = Math.max(1, Math.min(60, Math.round(Number(state.campaignDays) || 5)));

    const neededSeeded = Math.max(0, target - baseline);

    // Goal-Driven Requirement calculation (replicates screenshot):
    // 500 - 313 = 187 seeded needed. 187 / 0.35 = 534.28 -> 535 total onboardings required.
    const totalOnboardTarget = Math.ceil(neededSeeded / rateDecimal);
    const dailyOnboardTarget = Math.ceil(totalOnboardTarget / days);
    const normalizedTotalTarget = dailyOnboardTarget * days;

    const dailyExpectedSeeded = dailyOnboardTarget * rateDecimal;

    // Daily breakdown schedule
    const dailySchedule = [];
    let currentCumulative = baseline;

    for (let i = 0; i < days; i++) {
      const dayNum = i + 1;
      currentCumulative += dailyExpectedSeeded;

      // On final day, snap to target if within rounding margin
      let plannedCum = currentCumulative;
      if (i === days - 1 && Math.abs(plannedCum - target) < 1.5) {
        plannedCum = target;
      }

      dailySchedule.push({
        day: dayNum,
        dayLabel: `Day ${dayNum}`,
        dailyTargetOnboard: dailyOnboardTarget,
        dailyExpectedSeeded: dailyExpectedSeeded,
        projectedCumulativeSeeded: plannedCum
      });
    }

    return {
      target,
      baseline,
      ratePercent,
      rateDecimal,
      days,
      neededSeeded,
      dailyOnboardTarget,
      totalOnboardTarget: normalizedTotalTarget,
      dailyExpectedSeeded,
      dailySchedule
    };
  }

  // --- UI Update Function ---
  function updateUI() {
    const model = calculateModel();

    // 1. Update Subtitle
    if (elements.displaySubtitle) {
      elements.displaySubtitle.textContent = `${model.days}-day daily onboarding requirement & cumulative progress toward ${model.target.toLocaleString()} seeded creators`;
    }

    // 2. Update 4 KPI Cards
    if (elements.kpiConversionRate) {
      elements.kpiConversionRate.textContent = `${model.ratePercent.toFixed(1)}%`;
    }
    if (elements.kpiDailyTarget) {
      elements.kpiDailyTarget.textContent = model.dailyOnboardTarget.toLocaleString();
    }
    if (elements.kpiTotalTargetLabel) {
      elements.kpiTotalTargetLabel.textContent = `${model.days}-Day Total Target (Tapped)`;
    }
    if (elements.kpiTotalTarget) {
      elements.kpiTotalTarget.textContent = model.totalOnboardTarget.toLocaleString();
    }
    if (elements.kpiCumulativeTarget) {
      elements.kpiCumulativeTarget.textContent = model.target.toLocaleString();
    }
    if (elements.kpiCumulativeDenominator) {
      elements.kpiCumulativeDenominator.textContent = `/ ${model.target.toLocaleString()}`;
    }
    if (elements.kpiTargetSeededPerDay) {
      elements.kpiTargetSeededPerDay.textContent = model.dailyExpectedSeeded.toFixed(1);
    }

    // 3. Update Legend Goal Text
    if (elements.legendGoalText) {
      elements.legendGoalText.textContent = `${model.target.toLocaleString()} Goal Line`;
    }

    // 4. Update Inputs (without breaking active focus)
    if (document.activeElement !== elements.conversionSlider) {
      elements.conversionSlider.value = model.ratePercent;
    }
    if (document.activeElement !== elements.conversionNumberInput) {
      elements.conversionNumberInput.value = model.ratePercent.toFixed(1);
    }
    if (document.activeElement !== elements.cumulativeTargetInput) {
      elements.cumulativeTargetInput.value = model.target;
    }
    if (document.activeElement !== elements.baselineInput) {
      elements.baselineInput.value = model.baseline;
    }
    if (document.activeElement !== elements.scenarioNameDirectInput && elements.scenarioNameDirectInput) {
      elements.scenarioNameDirectInput.value = state.scenarioName;
    }

    // 5. Draw Purple Dual-Axis Chart
    renderChart(model);
  }

  // --- Dual-Axis Chart Canvas Renderer (Purple Theme) ---
  let hoveredDayIndex = -1;

  function renderChart(model) {
    const canvas = elements.trackerChart;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Get client dimensions
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 760;
    const height = rect.height || 380;

    // Adjust canvas resolution for crisp HiDPI displays
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Padding bounds for chart plot area
    const padding = {
      top: 36,
      right: 76,
      bottom: 52,
      left: 76
    };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    if (plotWidth <= 0 || plotHeight <= 0) {
      ctx.restore();
      return;
    }

    // Determine Y-Axes Bounds
    // Left Axis: Daily Onboarded Target (starts at 0)
    const leftMax = Math.max(10, Math.ceil((model.dailyOnboardTarget * 1.4) / 50) * 50);
    const leftMin = 0;

    // Right Axis: Cumulative Seeded
    const rawRightMin = model.baseline > 0 ? Math.floor((model.baseline * 0.9) / 50) * 50 : 0;
    const rawRightMax = Math.ceil((model.target * 1.05) / 20) * 20;
    const rightMin = Math.min(rawRightMin, Math.floor(model.baseline));
    const rightMax = Math.max(rawRightMax, model.target + 10);

    // Coordinate conversion
    function getYLeft(val) {
      return padding.top + plotHeight - ((val - leftMin) / (leftMax - leftMin)) * plotHeight;
    }

    function getYRight(val) {
      return padding.top + plotHeight - ((val - rightMin) / (rightMax - rightMin)) * plotHeight;
    }

    const numDays = model.days;
    const colStep = plotWidth / numDays;

    function getXCenter(dayIdx) {
      return padding.left + (dayIdx + 0.5) * colStep;
    }

    // 1. Draw Subtle Horizontal Grid Lines & Ticks (Purple tinted)
    const numGridLines = 4;
    ctx.strokeStyle = '#f3e8ff';
    ctx.lineWidth = 1;
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#6e6182';

    for (let i = 0; i <= numGridLines; i++) {
      const frac = i / numGridLines;
      const y = padding.top + plotHeight * (1 - frac);

      // Grid line
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotWidth, y);
      ctx.stroke();

      // Left axis label
      const leftVal = Math.round(leftMin + frac * (leftMax - leftMin));
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(leftVal.toString(), padding.left - 12, y);

      // Right axis label
      const rightVal = Math.round(rightMin + frac * (rightMax - rightMin));
      ctx.textAlign = 'left';
      ctx.fillText(rightVal.toString(), padding.left + plotWidth + 12, y);
    }

    // 2. Draw Left & Right Axis Titles (Rotated Vertical Text)
    ctx.save();
    ctx.font = 'italic 500 12.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#6e6182';

    // Left Axis Title: "Daily Onboarded Target"
    ctx.save();
    ctx.translate(padding.left - 48, padding.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Daily Onboarded Target', 0, 0);
    ctx.restore();

    // Right Axis Title: "Cumulative Seeded"
    ctx.save();
    ctx.translate(padding.left + plotWidth + 50, padding.top + plotHeight / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Cumulative Seeded', 0, 0);
    ctx.restore();

    ctx.restore();

    // 3. Draw Green Goal Line (Dashed horizontal line at Target Seeded coordinate)
    const goalY = getYRight(model.target);
    ctx.save();
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left + colStep * 0.2, goalY);
    ctx.lineTo(padding.left + plotWidth - colStep * 0.2, goalY);
    ctx.stroke();
    ctx.restore();

    // 4. Draw Hover Column Highlight if applicable (Light Purple wash)
    if (hoveredDayIndex >= 0 && hoveredDayIndex < numDays) {
      const hx = padding.left + hoveredDayIndex * colStep;
      ctx.fillStyle = 'rgba(124, 58, 237, 0.08)';
      ctx.fillRect(hx, padding.top, colStep, plotHeight);
    }

    // 5. Draw Purple Bars (Daily Onboarded Target with Pill Tops)
    // Dynamically size bar width based on available column space
    const maxBarW = Math.min(46, colStep * 0.72);
    const barWidth = Math.max(4, maxBarW);
    const barRadius = Math.min(barWidth / 2, 8);

    for (let i = 0; i < numDays; i++) {
      const cx = getXCenter(i);
      const bx = cx - barWidth / 2;
      const targetVal = model.dailySchedule[i].dailyTargetOnboard;
      const by = getYLeft(targetVal);

      ctx.fillStyle = '#7c3aed'; // Vibrant Purple matching user request

      // Draw rectangle with rounded top corners
      ctx.beginPath();
      ctx.moveTo(bx, padding.top + plotHeight);
      ctx.lineTo(bx, by + barRadius);
      ctx.quadraticCurveTo(bx, by, bx + barRadius, by);
      ctx.lineTo(bx + barWidth - barRadius, by);
      ctx.quadraticCurveTo(bx + barWidth, by, bx + barWidth, by + barRadius);
      ctx.lineTo(bx + barWidth, padding.top + plotHeight);
      ctx.closePath();
      ctx.fill();

      // X-Axis Day Labels: intelligently space labels so they never overlap
      // Determine label interval based on column width and total days
      let labelStep = 1;
      if (colStep < 30) {
        labelStep = Math.ceil(36 / colStep); // Show every Nth label to prevent collision
      }

      const shouldShowLabel = (i % labelStep === 0) || (i === numDays - 1 && (numDays - 1 - i + labelStep) >= labelStep * 0.7);

      if (shouldShowLabel) {
        const isCompact = colStep < 45;
        const labelText = isCompact ? `D${i + 1}` : `Day ${i + 1}`;
        const fontSize = colStep < 25 ? 10 : (colStep < 45 ? 11 : 12);

        ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = '#6e6182';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(labelText, cx, padding.top + plotHeight + 12);
      }
    }

    // 6. Draw Fuchsia / Magenta-Purple Line & Markers (Cumulative Seeded)
    const points = [];
    for (let i = 0; i < numDays; i++) {
      const cx = getXCenter(i);
      const cumVal = model.dailySchedule[i].projectedCumulativeSeeded;
      const cy = getYRight(cumVal);
      points.push({ x: cx, y: cy, val: cumVal, day: i + 1 });
    }

    if (points.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#d946ef'; // Fuchsia / Magenta-Purple
      ctx.lineWidth = 3.2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // Hollow circular white points with fuchsia border matching design
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#d946ef';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // --- Interactive Canvas Mouse Tracking & Tooltip ---
  function setupChartInteraction() {
    const canvas = elements.trackerChart;
    const tooltip = elements.chartTooltip;
    if (!canvas || !tooltip) return;

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const paddingLeft = 76;
      const paddingRight = 76;
      const plotWidth = rect.width - paddingLeft - paddingRight;

      if (mouseX < paddingLeft || mouseX > paddingLeft + plotWidth || mouseY < 30 || mouseY > rect.height - 40) {
        hoveredDayIndex = -1;
        tooltip.style.display = 'none';
        renderChart(calculateModel());
        return;
      }

      const colStep = plotWidth / state.campaignDays;
      const dayIdx = Math.floor((mouseX - paddingLeft) / colStep);

      if (dayIdx >= 0 && dayIdx < state.campaignDays) {
        hoveredDayIndex = dayIdx;
        const model = calculateModel();
        const sched = model.dailySchedule[dayIdx];

        tooltip.innerHTML = `
          <div class="tt-title">Day ${sched.day} Targets</div>
          <div class="tt-row"><span class="tt-label">Daily Onboard Target:</span> <span class="tt-val" style="color: #a78bfa">${sched.dailyTargetOnboard}</span></div>
          <div class="tt-row"><span class="tt-label">Expected Daily Seeded:</span> <span class="tt-val">${sched.dailyExpectedSeeded.toFixed(1)}</span></div>
          <div class="tt-row"><span class="tt-label">Cumulative Seeded:</span> <span class="tt-val" style="color: #f472b6">${Math.round(sched.projectedCumulativeSeeded)} / ${model.target}</span></div>
          <div class="tt-row"><span class="tt-label">Distance to Goal:</span> <span class="tt-val" style="color: #c4b5fd">${Math.max(0, model.target - Math.round(sched.projectedCumulativeSeeded))}</span></div>
        `;

        tooltip.style.display = 'block';
        tooltip.style.left = `${paddingLeft + (dayIdx + 0.5) * colStep}px`;
        tooltip.style.top = `${mouseY}px`;

        renderChart(model);
      }
    });

    canvas.addEventListener('mouseleave', () => {
      hoveredDayIndex = -1;
      tooltip.style.display = 'none';
      renderChart(calculateModel());
    });
  }

  // --- Toast Notification Helper ---
  function showToast(message, type = 'success') {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${type === 'error' ? '#f87171' : '#c4b5fd'}" stroke-width="2.5">
        ${type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>' : '<polyline points="20 6 9 17 4 12"></polyline>'}
      </svg>
      <span>${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }

  // --- Export Handlers ---
  function exportCSV() {
    const model = calculateModel();
    let csv = `Scenario: ${state.scenarioName}\n`;
    csv += `Cumulative Target: ${model.target}, Conversion Rate: ${model.ratePercent}%, Duration: ${model.days} Days\n\n`;
    csv += 'Day,Day Label,Daily Onboard Target,Expected Seeded Per Day,Cumulative Seeded Expected,Target Goal\n';

    model.dailySchedule.forEach(row => {
      csv += `${row.day},"${row.dayLabel}",${row.dailyTargetOnboard},${row.dailyExpectedSeeded.toFixed(2)},${Math.round(row.projectedCumulativeSeeded)},${model.target}\n`;
    });

    const safeName = (state.scenarioName || 'scenario').replace(/[^a-z0-9_-]/gi, '_');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}-Target-${model.target}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported "${state.scenarioName}" to CSV`);
  }

  function exportJSON() {
    const model = calculateModel();
    const exportData = {
      app: 'Creator Seeding & Onboarding Target Tracker',
      scenarioName: state.scenarioName,
      exportedAt: new Date().toISOString(),
      parameters: {
        cumulativeTarget: model.target,
        conversionRatePercent: model.ratePercent,
        baselineSeeded: model.baseline,
        campaignDays: model.days,
        dailyOnboardTarget: model.dailyOnboardTarget,
        totalOnboardTarget: model.totalOnboardTarget
      },
      schedule: model.dailySchedule
    };

    const safeName = (state.scenarioName || 'scenario').replace(/[^a-z0-9_-]/gi, '_');
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported "${state.scenarioName}" to JSON`);
  }

  function exportPNG() {
    const canvas = elements.trackerChart;
    if (!canvas) return;

    const model = calculateModel();
    const dpr = window.devicePixelRatio || 1;
    const chartW = canvas.width;
    const chartH = canvas.height;

    // Header height (brand + KPI strip)
    const headerH = Math.round(230 * dpr);
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = chartW;
    exportCanvas.height = chartH + headerH;

    const ctx = exportCanvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // ── Top purple accent bar ──
    const grad = ctx.createLinearGradient(0, 0, exportCanvas.width, 0);
    grad.addColorStop(0, '#7c3aed');
    grad.addColorStop(1, '#a855f7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, exportCanvas.width, 5 * dpr);

    // ── Brand header ──
    const pad = 36 * dpr;
    ctx.font = `700 ${13 * dpr}px "Outfit", sans-serif`;
    ctx.fillStyle = '#7c3aed';
    ctx.fillText('STAR DIGITAL AFFILIATE MARKETING', pad, 28 * dpr);

    ctx.font = `800 ${20 * dpr}px "Outfit", sans-serif`;
    ctx.fillStyle = '#190e2b';
    ctx.fillText(state.scenarioName, pad, 56 * dpr);

    ctx.font = `500 ${12 * dpr}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#5e5173';
    ctx.fillText(
      `${model.days}-Day Campaign \u2022 ${model.ratePercent.toFixed(1)}% Conversion Rate \u2022 Target: ${model.target.toLocaleString()} Seeded Creators`,
      pad, 76 * dpr
    );

    // ── KPI Cards strip ──
    const kpis = [
      { label: 'Conversion Rate',               value: `${model.ratePercent.toFixed(1)}%`,                        unit: '' },
      { label: 'Daily Onboard Target',           value: model.dailyOnboardTarget.toLocaleString(),                unit: '/ day' },
      { label: `${model.days}-Day Total Target (Tapped)`, value: model.totalOnboardTarget.toLocaleString(),       unit: '' },
      { label: 'Cumulative Target (Seeded)',     value: `${model.target.toLocaleString()}`,                       unit: `/ ${model.target.toLocaleString()}` },
      { label: 'Target Seeded / Day',            value: model.dailyExpectedSeeded.toFixed(1),                     unit: '/ day', accent: true }
    ];

    const kpiTop = 96 * dpr;
    const kpiH = 108 * dpr;
    const kpiGap = 10 * dpr;
    const totalKpiW = exportCanvas.width - pad * 2;
    const kpiW = (totalKpiW - kpiGap * (kpis.length - 1)) / kpis.length;
    const kpiRadius = 10 * dpr;

    kpis.forEach((kpi, i) => {
      const kx = pad + i * (kpiW + kpiGap);
      const ky = kpiTop;

      // Card background
      ctx.fillStyle = kpi.accent ? '#f5f0ff' : '#faf9fe';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(kx, ky, kpiW, kpiH, kpiRadius)
                    : ctx.rect(kx, ky, kpiW, kpiH);
      ctx.fill();

      // Card border
      ctx.strokeStyle = kpi.accent ? '#c4b5fd' : '#ede9fe';
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(kx, ky, kpiW, kpiH, kpiRadius)
                    : ctx.rect(kx, ky, kpiW, kpiH);
      ctx.stroke();

      // Label
      ctx.font = `500 ${10.5 * dpr}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = '#6e6182';
      ctx.textAlign = 'left';
      ctx.fillText(kpi.label, kx + 14 * dpr, ky + 28 * dpr);

      // Value
      ctx.font = `700 ${22 * dpr}px "Outfit", sans-serif`;
      ctx.fillStyle = kpi.accent ? '#7c3aed' : '#190e2b';
      ctx.fillText(kpi.value, kx + 14 * dpr, ky + 68 * dpr);

      // Unit
      if (kpi.unit) {
        ctx.font = `500 ${11 * dpr}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = '#8a7e9c';
        ctx.fillText(kpi.unit, kx + 14 * dpr, ky + 90 * dpr);
      }
    });

    ctx.textAlign = 'left';

    // ── Draw chart ──
    ctx.drawImage(canvas, 0, headerH);

    // ── Footer note ──
    ctx.font = `500 ${10.5 * dpr}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(
      `Star Digital Affiliate Marketing \u2022 Creator Seeding & Onboarding Target Tracker \u2022 Exported ${new Date().toLocaleDateString()}`,
      pad, exportCanvas.height - 8 * dpr
    );

    const safeName = (state.scenarioName || 'scenario').replace(/[^a-z0-9_-]/gi, '_');
    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}-Chart.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Chart exported as high-resolution PNG image');
    });
  }

  function copyTableToClipboard() {
    const model = calculateModel();
    let tsv = `Scenario\t${state.scenarioName}\n`;
    tsv += 'Day\tDaily Target Onboarded\tExpected Seeded/Day\tCumulative Seeded\n';

    model.dailySchedule.forEach(row => {
      tsv += `${row.dayLabel}\t${row.dailyTargetOnboard}\t${row.dailyExpectedSeeded.toFixed(1)}\t${Math.round(row.projectedCumulativeSeeded)}\n`;
    });

    navigator.clipboard.writeText(tsv).then(() => {
      showToast('Copied schedule data to clipboard');
    }).catch(err => {
      console.error('Clipboard copy failed:', err);
      showToast('Failed to copy to clipboard', 'error');
    });
  }

  // --- Scenario Management & Custom Naming UI ---
  function openScenarioModal() {
    renderScenarioList();
    elements.scenarioModal.classList.add('open');
  }

  function closeScenarioModal() {
    elements.scenarioModal.classList.remove('open');
  }

  function renderScenarioList() {
    const container = elements.scenarioListContainer;
    if (!container) return;

    const list = getStoredScenarios();
    container.innerHTML = '';

    if (list.length === 0) {
      container.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No saved scenarios yet.</p>`;
      return;
    }

    list.forEach((sc, idx) => {
      const item = document.createElement('div');
      item.className = 'scenario-item';

      const dateStr = sc.timestamp ? new Date(sc.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

      item.innerHTML = `
        <div class="scenario-info">
          <div class="scenario-info-title">
            <span>${sc.name}</span>
            <button class="btn btn-ghost btn-sm btn-rename-scenario" data-index="${idx}" title="Rename this scenario" style="padding: 2px 6px; font-size: 11px;">
              ✏️ Rename
            </button>
          </div>
          <div class="scenario-info-meta">
            Target: <strong>${sc.cumulativeTarget}</strong> &bull; 
            Conv: <strong>${Number(sc.conversionRate).toFixed(1)}%</strong> &bull; 
            Duration: <strong>${sc.campaignDays} Days</strong> &bull; 
            Base: <strong>${sc.baselineSeeded || 0}</strong>
            ${dateStr ? ` &bull; <span style="color: var(--text-muted)">${dateStr}</span>` : ''}
          </div>
        </div>
        <div class="scenario-item-actions">
          <button class="btn btn-sm btn-primary btn-load-scenario" data-index="${idx}">Load</button>
          ${!sc.isSystem ? `<button class="btn btn-sm btn-ghost btn-delete-scenario" data-index="${idx}" title="Delete" style="color: #ef4444">&times;</button>` : ''}
        </div>
      `;

      container.appendChild(item);
    });

    // Attach listeners
    container.querySelectorAll('.btn-load-scenario').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        loadScenarioByIndex(idx);
      });
    });

    container.querySelectorAll('.btn-rename-scenario').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        promptRenameScenario(idx);
      });
    });

    container.querySelectorAll('.btn-delete-scenario').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        deleteScenarioByIndex(idx);
      });
    });
  }

  function loadScenarioByIndex(index) {
    const list = getStoredScenarios();
    const sc = list[index];
    if (!sc) return;

    state.scenarioName = sc.name;
    const trackerData = sc.tracker || sc;
    state.cumulativeTarget = Number(trackerData.cumulativeTarget) || 500;
    state.conversionRate = Number(trackerData.conversionRate) || 35.0;
    state.baselineSeeded = Number(trackerData.baselineSeeded) || 0;
    state.campaignDays = Number(trackerData.campaignDays) || 5;

    // Sync select dropdown for days
    if (elements.campaignDaysSelect) {
      const matchOpt = Array.from(elements.campaignDaysSelect.options).find(o => parseInt(o.value, 10) === state.campaignDays);
      if (matchOpt) {
        elements.campaignDaysSelect.value = state.campaignDays.toString();
        elements.customDaysInput.classList.add('hidden');
      } else {
        elements.campaignDaysSelect.value = 'custom';
        elements.customDaysInput.value = state.campaignDays;
        elements.customDaysInput.classList.remove('hidden');
      }
    }

    closeScenarioModal();
    updateUI();
    showToast(`Loaded scenario: "${sc.name}"`);
  }

  function deleteScenarioByIndex(index) {
    const list = getStoredScenarios();
    const removed = list.splice(index, 1);
    saveStoredScenarios(list);
    renderScenarioList();
    showToast(`Deleted scenario "${removed[0]?.name || ''}"`);
  }

  function promptRenameScenario(index) {
    const list = getStoredScenarios();
    const sc = list[index];
    if (!sc) return;

    editingScenarioId = sc.id;
    elements.namePromptModalTitle.textContent = 'Rename Scenario';
    elements.scenarioNameInput.value = sc.name;
    elements.namePromptModal.classList.add('open');
    elements.scenarioNameInput.focus();
    elements.scenarioNameInput.select();
  }

  function promptSaveCurrentScenario() {
    editingScenarioId = null; // New save mode
    elements.namePromptModalTitle.textContent = 'Save Scenario';
    elements.scenarioNameInput.value = state.scenarioName || `${state.cumulativeTarget} Target @ ${Number(state.conversionRate).toFixed(1)}% Conv`;
    elements.namePromptModal.classList.add('open');
    elements.scenarioNameInput.focus();
    elements.scenarioNameInput.select();
  }

  function confirmSaveScenario() {
    const customName = elements.scenarioNameInput.value.trim() || `Scenario ${Date.now()}`;
    const list = getStoredScenarios();

    if (editingScenarioId) {
      // Renaming an existing scenario
      StarDigitalStore.renameSavedScenario(editingScenarioId, customName);
      if (state.scenarioName === customName) {
        state.scenarioName = customName;
      }
      renderScenarioList();
      updateUI();
      showToast(`Renamed to "${customName}"`);
    } else {
      // Creating a new saved scenario with selected scope
      state.scenarioName = customName;
      const scope = document.querySelector('input[name="trackerSaveScope"]:checked')?.value || 'all';

      StarDigitalStore.addSavedScenario({
        name: customName,
        scope: scope,
        trackerData: {
          cumulativeTarget: state.cumulativeTarget,
          conversionRate: state.conversionRate,
          baselineSeeded: state.baselineSeeded,
          campaignDays: state.campaignDays,
          scenarioName: customName
        }
      });

      updateUI();
      showToast(`Saved scenario "${customName}" (${scope === 'all' ? 'All Continuous' : 'Tracker Only'})!`);
    }

    elements.namePromptModal.classList.remove('open');
    updateScenarioCount();
  }

  // --- Attach Event Listeners ---
  function setupEvents() {
    // 1. Conversion Rate Slider
    elements.conversionSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.conversionRate = val;
      elements.conversionNumberInput.value = val.toFixed(1);
      updateUI();
    });

    // 3. Conversion Number Input
    elements.conversionNumberInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 0.1 && val <= 100) {
        state.conversionRate = val;
        elements.conversionSlider.value = val;
        updateUI();
      }
    });

    // 4. Cumulative Target Input
    elements.cumulativeTargetInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val > 0) {
        state.cumulativeTarget = val;
        updateUI();
      }
    });

    // Quick Target Adjustment buttons (+/- 50, +100)
    document.querySelectorAll('[data-target-delta]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const delta = parseInt(e.currentTarget.getAttribute('data-target-delta'), 10);
        state.cumulativeTarget = Math.max(10, state.cumulativeTarget + delta);
        elements.cumulativeTargetInput.value = state.cumulativeTarget;
        updateUI();
      });
    });

    // 5. Baseline Input
    elements.baselineInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 0) {
        state.baselineSeeded = val;
        updateUI();
      }
    });

    // Quick Baseline Buttons
    document.getElementById('btnZeroBaseline')?.addEventListener('click', () => {
      state.baselineSeeded = 0;
      elements.baselineInput.value = 0;
      updateUI();
      showToast('Baseline set to 0 (Fresh Start)');
    });

    document.getElementById('btnStandardBaseline')?.addEventListener('click', () => {
      state.baselineSeeded = 313;
      elements.baselineInput.value = 313;
      updateUI();
      showToast('Baseline set to 313 (Current Baseline)');
    });

    // 6. Campaign Days Select
    elements.campaignDaysSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'custom') {
        elements.customDaysInput.classList.remove('hidden');
        state.campaignDays = parseInt(elements.customDaysInput.value, 10) || 5;
      } else {
        elements.customDaysInput.classList.add('hidden');
        state.campaignDays = parseInt(val, 10);
      }
      updateUI();
    });

    elements.customDaysInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 1 && val <= 60) {
        state.campaignDays = val;
        updateUI();
      }
    });

    // Quick Day Buttons (3d, 5d, 7d, 14d)
    document.querySelectorAll('.day-quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const days = parseInt(e.currentTarget.getAttribute('data-days'), 10);
        state.campaignDays = days;
        elements.campaignDaysSelect.value = days.toString();
        elements.customDaysInput.classList.add('hidden');
        updateUI();
        showToast(`Campaign duration set to ${days} days`);
      });
    });

    // 8. Export Dropdown Menu
    elements.btnExportMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.exportDropdown.parentElement.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!elements.btnExportMenu.contains(e.target)) {
        elements.exportDropdown.parentElement.classList.remove('open');
      }
    });

    // Export Options
    elements.exportCsvBtn.addEventListener('click', () => {
      elements.exportDropdown.parentElement.classList.remove('open');
      exportCSV();
    });

    elements.exportJsonBtn.addEventListener('click', () => {
      elements.exportDropdown.parentElement.classList.remove('open');
      exportJSON();
    });

    elements.exportPngBtn.addEventListener('click', () => {
      elements.exportDropdown.parentElement.classList.remove('open');
      exportPNG();
    });

    elements.copyClipboardBtn.addEventListener('click', () => {
      elements.exportDropdown.parentElement.classList.remove('open');
      copyTableToClipboard();
    });

    elements.printReportBtn.addEventListener('click', () => {
      elements.exportDropdown.parentElement.classList.remove('open');
      window.print();
    });

    // 9. Modals
    if (elements.btnOpenScenarioModal) {
      elements.btnOpenScenarioModal.addEventListener('click', openScenarioModal);
    }
    if (elements.closeScenarioModalBtn) {
      elements.closeScenarioModalBtn.addEventListener('click', closeScenarioModal);
    }

    elements.btnSaveCurrentScenario.addEventListener('click', promptSaveCurrentScenario);
    elements.btnModalSaveNew.addEventListener('click', () => {
      closeScenarioModal();
      promptSaveCurrentScenario();
    });

    elements.confirmSaveScenarioBtn.addEventListener('click', confirmSaveScenario);
    elements.cancelSaveScenarioBtn.addEventListener('click', () => {
      elements.namePromptModal.classList.remove('open');
    });
    elements.closeNamePromptBtn.addEventListener('click', () => {
      elements.namePromptModal.classList.remove('open');
    });

    // Close modal on escape or background click
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        elements.scenarioModal.classList.remove('open');
        elements.namePromptModal.classList.remove('open');
      }
    });

    [elements.scenarioModal, elements.namePromptModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    });

    // Window Resize Handler for Chart Canvas
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderChart(calculateModel());
      }, 100);
    });
  }

  // --- App Initialization ---
  function init() {
    if (typeof StarDigitalStore !== 'undefined') {
      const activeTracker = StarDigitalStore.getTrackerState();
      if (activeTracker) {
        state.scenarioName = StarDigitalStore.getActiveCampaignName() || state.scenarioName;
        state.cumulativeTarget = Number(activeTracker.cumulativeTarget) || state.cumulativeTarget;
        state.conversionRate = Number(activeTracker.conversionRate) || state.conversionRate;
        state.baselineSeeded = Number(activeTracker.baselineSeeded) || state.baselineSeeded;
        state.campaignDays = Number(activeTracker.campaignDays) || state.campaignDays;
      }
    }
    updateScenarioCount();
    setupEvents();
    setupChartInteraction();
    updateUI();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
