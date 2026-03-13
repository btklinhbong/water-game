// -------------------------------------------------------------
// 1) Game state (like member variables in Java/C++)
// -------------------------------------------------------------
let health = 75;
let hydration = 75;
let sanity = 75;
let gpa = 75;
let currentTurn = 0;
let endGameTimerId = null;

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
const fadeOverlay = document.getElementById("fade-overlay");
const endGameModal = document.getElementById("end-game-modal");
const endGameTitle = document.getElementById("end-game-title");
const endGameDescription = document.getElementById("end-game-description");
const playAgainButton = document.getElementById("play-again-button");
const resetGameButton = document.getElementById("reset-game-button");

// -------------------------------------------------------------
// 4) Rendering helpers
// -------------------------------------------------------------
function clampStat(value) {
  return Math.max(0, Math.min(100, value));
}// đặt ra giới hạn

function updateBarDangerMode(barElement, value) {
  if (value < 30) {
    barElement.classList.add("danger-mode");
  } else {
    barElement.classList.remove("danger-mode");
  }
}

function renderStats() {
  healthBar.style.width = `${health}%`;
  hydrationBar.style.width = `${hydration}%`;
  sanityBar.style.width = `${sanity}%`;
  gpaBar.style.width = `${gpa}%`;

  updateBarDangerMode(healthBar, health);
  updateBarDangerMode(hydrationBar, hydration);
  updateBarDangerMode(sanityBar, sanity);
  updateBarDangerMode(gpaBar, gpa);
}

function updateUI() {
  renderStats();
}

function applyScenarioEffects(effects) {
  health = clampStat(health + (effects.health ?? 0));
  hydration = clampStat(hydration + (effects.hydration ?? 0));
  sanity = clampStat(sanity + (effects.sanity ?? 0));
  gpa = clampStat(gpa + (effects.gpa ?? 0));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

// -------------------------------------------------------------
// 5) Scenario progression + save/load helpers
// -------------------------------------------------------------
function renderCurrentScenario() {
  if (!scenarios.length) return;

  if (currentTurn >= scenarios.length) {
    return;
  }

  const scenarioIndex = currentTurn;
  const scenario = scenarios[scenarioIndex];

  scenarioTitleElement.textContent = scenario.title;
  scenarioTextElement.textContent = scenario.description;
  optionAButton.textContent = scenario.optionA.text;
  optionBButton.textContent = scenario.optionB.text;
}

function loadScenario() {
  renderCurrentScenario();
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

  updateUI();
  loadScenario();
}

function resetGame() {
  health = 75;
  hydration = 75;
  sanity = 75;
  gpa = 75;
  currentTurn = 0;

  if (endGameTimerId !== null) {
    clearTimeout(endGameTimerId);
    endGameTimerId = null;
  }

  fadeOverlay.classList.remove("active");
  endGameModal.style.display = "none";
  optionAButton.disabled = false;
  optionBButton.disabled = false;

  updateUI();
  loadScenario();
  saveGameState();
}

function handleChoice(optionKey) {
  if (!scenarios.length) return;

  if (checkGameEnd()) return;

  if (currentTurn >= scenarios.length) return;

  const scenarioIndex = currentTurn;
  const scenario = scenarios[scenarioIndex];
  const selectedOption = optionKey === "A" ? scenario.optionA : scenario.optionB;// chọn option nào

  applyScenarioEffects(selectedOption.effects);
  currentTurn += 1;
  saveGameState();
  renderStats();

  if (checkGameEnd()) {
    return;
  }

  renderCurrentScenario();
}

function showEndGameModal(title, description) {
  /*
    STEP 1: Disable buttons immediately so user can't make more choices
  */
  optionAButton.disabled = true;
  optionBButton.disabled = true;

  /*
    STEP 2: Trigger the fade-in animation by adding the "active" class.
    This changes fade-overlay.opacity from 0 to 1 over 2 seconds
    (see the CSS transition rule).
  */
  fadeOverlay.classList.add("active");

  /*
    STEP 3: Use setTimeout to wait exactly 2 seconds before showing the modal.
    This synchronizes with the CSS transition duration.
    
    setTimeout EXPLAINED:
    -----
    setTimeout(function, milliseconds)
    
    - Schedules a function to run AFTER a delay
    - The delay is in milliseconds (so 2000 = 2 seconds)
    - The code OUTSIDE setTimeout runs immediately
    - The code INSIDE setTimeout runs after the delay
    
    This is how we sequence events in JavaScript:
    1) Start fade (immediately)
    2) Wait 2 seconds (setTimeout)
    3) Show end screen (after 2 seconds)
    
    Without setTimeout, all three would happen instantly!
  */
  if (endGameTimerId !== null) {
    clearTimeout(endGameTimerId);
  }

  endGameTimerId = setTimeout(function () {
    // Now the overlay is fully faded in, so show the modal content
    endGameTitle.textContent = title;
    endGameDescription.textContent = description;
    endGameModal.style.display = "flex";
    endGameTimerId = null;
  }, 2000);  // 2000 milliseconds = 2 seconds
}

function endGame(result, title, description) {
  if (result === "win" && typeof confetti === "function") {
    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.6 },
    });
  }

  showEndGameModal(title, description);
}

function checkGameEnd() {
  if (health <= 0) {
    endGame(
      "lose",
      "Health Depleted",
      "Your body gave out from prolonged physical strain and unsafe conditions. In the real world, inadequate access to clean water can quickly become a life-threatening health crisis."
    );
    return true;
  }

  if (hydration <= 0) {
    endGame(
      "lose",
      "Severe Dehydration",
      "You collapsed from severe dehydration. In the real world, lack of clean water is a daily physical threat."
    );
    return true;
  }

  if (sanity <= 0) {
    endGame(
      "lose",
      "Mental Breakdown",
      "Constant stress and uncertainty overwhelmed you. Water insecurity can affect mental well-being as deeply as physical health."
    );
    return true;
  }

  if (gpa <= 0) {
    endGame(
      "lose",
      "Academic Collapse",
      "You failed your classes. The time spent finding water cost you your education, a reality for millions globally."
    );
    return true;
  }

  if (currentTurn >= scenarios.length) {
    endGame(
      "win",
      "You Survived",
      "You completed every scenario with your Health, Hydration, Sanity, and GPA still above zero. You adapted, endured, and made it through."
    );
    return true;
  }

  return false;
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

playAgainButton.addEventListener("click", function () {
  resetGame();
});

if (resetGameButton) {
  resetGameButton.addEventListener("click", function () {
    resetGame();
  });
}

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
    shuffleArray(scenarios);
    console.log(`✓ Loaded ${scenarios.length} scenarios`);
  } catch (error) {
    console.error("Error loading scenarios:", error);
  }
}

// Load scenarios and initialize game ONLY after JSON loads
loadScenariosFromJSON().then(() => {
  initializeGame();
  checkGameEnd();
});
