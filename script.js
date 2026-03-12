// -------------------------------------------------------------
// 1) Game state (like member variables in Java/C++)
// -------------------------------------------------------------
let health = 75;
let hydration = 75;
let sanity = 75;
let gpa = 75;
let currentTurn = 0;

// -------------------------------------------------------------
// 2) Scenario data (loaded from JSON file)
// -------------------------------------------------------------
let scenarios = [];  // Will be populated by fetch()
const SAVE_KEY = "waterGameSave";

// -------------------------------------------------------------
// 3) Grab elements from the DOM (the HTML tree in memory)
// -------------------------------------------------------------
const healthBar = document.getElementById("health-bar");
const hydrationBar = document.getElementById("hydration-bar");
const sanityBar = document.getElementById("sanity-bar");
const gpaBar = document.getElementById("gpa-bar");

const scenarioTitleElement = document.querySelector(".scenario-title");
const scenarioTextElement = document.querySelector(".scenario-text");
const optionAButton = document.getElementById("option-a-button");
const optionBButton = document.getElementById("option-b-button");

// -------------------------------------------------------------
// 4) Rendering helpers
// -------------------------------------------------------------
function clampStat(value) {
  return Math.max(0, Math.min(100, value));
}// đặt ra giới hạn

function renderStats() {
  healthBar.style.width = `${health}%`;
  hydrationBar.style.width = `${hydration}%`;
  sanityBar.style.width = `${sanity}%`;
  gpaBar.style.width = `${gpa}%`;
}

function applyScenarioEffects(effects) {
  health = clampStat(health + (effects.health ?? 0));
  hydration = clampStat(hydration + (effects.hydration ?? 0));
  sanity = clampStat(sanity + (effects.sanity ?? 0));
  gpa = clampStat(gpa + (effects.gpa ?? 0));
}

// -------------------------------------------------------------
// 5) Scenario progression + save/load helpers
// -------------------------------------------------------------
function renderCurrentScenario() {
  if (!scenarios.length) return;

  const scenarioIndex = currentTurn % scenarios.length;
  const scenario = scenarios[scenarioIndex];

  scenarioTitleElement.textContent = scenario.title;
  scenarioTextElement.textContent = scenario.description;
  optionAButton.textContent = scenario.optionA.text;
  optionBButton.textContent = scenario.optionB.text;
}

function saveGameState() {
  const gameState = {
    health,
    hydration,
    sanity,
    gpa,
    currentTurn,
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

function startNewGame() {
  health = 75;
  hydration = 75;
  sanity = 75;
  gpa = 75;
  currentTurn = 0;
}

function initializeGame() {
  const saved = localStorage.getItem(SAVE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      health = clampStat(Number(parsed.health ?? 75));
      hydration = clampStat(Number(parsed.hydration ?? 75));
      sanity = clampStat(Number(parsed.sanity ?? 75));
      gpa = clampStat(Number(parsed.gpa ?? 75));
      currentTurn = Math.max(0, Number(parsed.currentTurn ?? 0));
    } catch (error) {
      console.error("Save file is invalid, starting new game:", error);
      startNewGame();
      saveGameState();
    }
  } else {
    startNewGame();
    saveGameState();
  }

  renderStats();
  renderCurrentScenario();
}

function handleChoice(optionKey) {
  if (!scenarios.length) return;

  const scenarioIndex = currentTurn % scenarios.length;
  const scenario = scenarios[scenarioIndex];
  const selectedOption = optionKey === "A" ? scenario.optionA : scenario.optionB;

  applyScenarioEffects(selectedOption.effects);
  currentTurn += 1;
  saveGameState();
  renderStats();
  renderCurrentScenario();
}

// -------------------------------------------------------------
// 6) Event listeners
// -------------------------------------------------------------
optionAButton.addEventListener("click", function () {
  handleChoice("A");
});

optionBButton.addEventListener("click", function () {
  handleChoice("B");
});

// ============================================================
// 7) Load scenarios from JSON file
// ============================================================
async function loadScenariosFromJSON() {
  try {
    const response = await fetch("scenarios.json");

    if (!response.ok) {
      throw new Error(`Failed to load scenarios: ${response.status}`);
    }

    scenarios = await response.json();
    console.log(`✓ Loaded ${scenarios.length} scenarios`);
  } catch (error) {
    console.error("Error loading scenarios:", error);
  }
}

// Load scenarios and initialize game ONLY after JSON loads
loadScenariosFromJSON().then(() => {
  initializeGame();
});
