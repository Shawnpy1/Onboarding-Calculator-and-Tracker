/**
 * Star Digital Affiliate Marketing
 * Unified Shared Data Store & Scenario Manager
 * Coordinates Campaign Flow across Home Page, Acceptance Calculator & Target Tracker
 */

const StarDigitalStore = (() => {
  'use strict';

  const STORAGE_KEYS = {
    CAMPAIGN: 'star_digital_active_campaign_name_v5',
    ACCEPTANCE_OVERALL: 'star_digital_acceptance_overall_v5',
    ACCEPTANCE_PERIODS: 'star_digital_acceptance_durations_v5',
    TRACKER_STATE: 'star_digital_tracker_state_v5',
    SAVED_SCENARIOS: 'star_digital_saved_scenarios_v5'
  };

  // --- Campaign Name ---
  function getActiveCampaignName() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGN);
      if (saved && saved.trim()) return saved.trim();
    } catch (e) {
      console.warn('Error reading campaign name:', e);
    }
    return 'Star Digital Campaign';
  }

  function setActiveCampaignName(name) {
    if (!name || !name.trim()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGN, name.trim());
    } catch (e) {
      console.warn('Error saving campaign name:', e);
    }
  }

  // --- Acceptance Calculator Overall ---
  function getAcceptanceOverall() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCEPTANCE_OVERALL);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { tapped: 300, onboarded: 105 };
  }

  function setAcceptanceOverall(data) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCEPTANCE_OVERALL, JSON.stringify(data));
    } catch (e) {}
  }

  // --- Acceptance Periods ---
  function getAcceptancePeriods() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCEPTANCE_PERIODS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [
      { id: 'p1', label: 'Week 1 (Outreach Launch)', tapped: 80, onboarded: 24, type: 'WEEK' },
      { id: 'p2', label: 'Week 2 (Outreach Acceleration)', tapped: 120, onboarded: 44, type: 'WEEK' },
      { id: 'p3', label: 'Week 3 (Mid-Campaign Push)', tapped: 100, onboarded: 37, type: 'WEEK' }
    ];
  }

  function setAcceptancePeriods(periods) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCEPTANCE_PERIODS, JSON.stringify(periods));
    } catch (e) {}
  }

  // --- Tracker State ---
  function getTrackerState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRACKER_STATE);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      scenarioName: getActiveCampaignName(),
      cumulativeTarget: 500,
      conversionRate: 35.0,
      baselineSeeded: 0,
      campaignDays: 5
    };
  }

  function setTrackerState(state) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRACKER_STATE, JSON.stringify(state));
    } catch (e) {}
  }

  // --- Unified Scenarios List ---
  function getSavedScenarios() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_SCENARIOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  function saveSavedScenarios(list) {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_SCENARIOS, JSON.stringify(list));
    } catch (e) {}
  }

  /**
   * Save a scenario with customizable scope:
   * scope: 'all' (continuous flow: acceptance + tracker), 'acceptance_only', or 'tracker_only'
   */
  function addSavedScenario({ name, scope = 'all', acceptanceData = null, trackerData = null }) {
    const list = getSavedScenarios();
    const scenarioName = name && name.trim() ? name.trim() : `${getActiveCampaignName()} (${new Date().toLocaleDateString()})`;

    const newScenario = {
      id: `sc_${Date.now()}`,
      name: scenarioName,
      timestamp: new Date().toISOString(),
      scope: scope, // 'all' | 'acceptance_only' | 'tracker_only'
      acceptance: (scope === 'all' || scope === 'acceptance_only')
        ? (acceptanceData || { overall: getAcceptanceOverall(), periods: getAcceptancePeriods() })
        : null,
      tracker: (scope === 'all' || scope === 'tracker_only')
        ? (trackerData || getTrackerState())
        : null
    };

    list.unshift(newScenario);
    saveSavedScenarios(list);
    return newScenario;
  }

  function deleteSavedScenario(id) {
    const list = getSavedScenarios();
    const filtered = list.filter(s => s.id !== id);
    saveSavedScenarios(filtered);
    return filtered;
  }

  function renameSavedScenario(id, newName) {
    const list = getSavedScenarios();
    const item = list.find(s => s.id === id);
    if (item && newName && newName.trim()) {
      item.name = newName.trim();
      item.timestamp = new Date().toISOString();
      saveSavedScenarios(list);
    }
    return list;
  }

  function loadScenarioToActive(scenario) {
    if (!scenario) return;
    setActiveCampaignName(scenario.name);

    if (scenario.acceptance) {
      if (scenario.acceptance.overall) setAcceptanceOverall(scenario.acceptance.overall);
      if (scenario.acceptance.periods) setAcceptancePeriods(scenario.acceptance.periods);
    }

    if (scenario.tracker) {
      setTrackerState({
        ...scenario.tracker,
        scenarioName: scenario.name
      });
    }
  }

  return {
    getActiveCampaignName,
    setActiveCampaignName,
    getAcceptanceOverall,
    setAcceptanceOverall,
    getAcceptancePeriods,
    setAcceptancePeriods,
    getTrackerState,
    setTrackerState,
    getSavedScenarios,
    saveSavedScenarios,
    addSavedScenario,
    deleteSavedScenario,
    renameSavedScenario,
    loadScenarioToActive
  };
})();
