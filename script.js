// -------------------------------------------------------------
// 1) Game state (like member variables in Java/C++)
// -------------------------------------------------------------
let health = 75;
let hydration = 75;
let sanity = 75;
let gpa = 75;
let currentScenarioIndex = 0;

// -------------------------------------------------------------
// 2) Scenario data (array of JS objects)
// -------------------------------------------------------------
const scenarios = [
  {
    title: "1. A Difficult Choice",
    description:
      "You have one bottle of clean water left and exams tomorrow. Do you save the water for later, or drink now to think clearly?",
    optionA: {
      text: "Drink now",
      effects: { health: 0, hydration: 10, sanity: 5, gpa: 2 },
    },
    optionB: {
      text: "Save for later",
      effects: { health: -2, hydration: -8, sanity: -3, gpa: 3 },
    },
  },
  {
    title: "2. Gym vs Group Study",
    description:
      "You can either attend a quick workout session or stay for one more hour of group revision.",
    optionA: {
      text: "Go to gym",
      effects: { health: 8, hydration: -6, sanity: 4, gpa: -2 },
    },
    optionB: {
      text: "Stay and study",
      effects: { health: -3, hydration: -4, sanity: -2, gpa: 6 },
    },
  },
  {
    title: "3. Late-Night Cram",
    description:
      "A friend offers energy drinks for an all-night study session before finals.",
    optionA: {
      text: "Join cram session",
      effects: { health: -6, hydration: -10, sanity: -5, gpa: 8 },
    },
    optionB: {
      text: "Sleep early",
      effects: { health: 6, hydration: 3, sanity: 7, gpa: -3 },
    },
  },
];

// -------------------------------------------------------------
// 3) Grab elements from the DOM (the HTML tree in memory)
// -------------------------------------------------------------
const healthStatLabel = document.getElementById("health-stat");
const hydrationStatLabel = document.getElementById("hydration-stat");
const sanityStatLabel = document.getElementById("sanity-stat");
const gpaStatLabel = document.getElementById("gpa-stat");

const scenarioTitleElement = document.querySelector(".scenario-title");
const scenarioTextElement = document.querySelector(".scenario-text");
const optionAButton = document.getElementById("option-a-button");
const optionBButton = document.getElementById("option-b-button");

// -------------------------------------------------------------
// 4) Rendering helpers
// -------------------------------------------------------------
function clampStat(value) {
  return Math.max(0, Math.min(100, value));
}

function renderStats() {
  healthStatLabel.textContent = `Health: ${health}`;
  hydrationStatLabel.textContent = `Hydration: ${hydration}`;
  sanityStatLabel.textContent = `Sanity: ${sanity}`;
  gpaStatLabel.textContent = `GPA: ${gpa}`;
}

function applyScenarioEffects(effects) {
  health = clampStat(health + (effects.health ?? 0));
  hydration = clampStat(hydration + (effects.hydration ?? 0));
  sanity = clampStat(sanity + (effects.sanity ?? 0));
  gpa = clampStat(gpa + (effects.gpa ?? 0));
}

// -------------------------------------------------------------
// 5) Scenario progression
// -------------------------------------------------------------
function loadNextScenario() {
  const scenario = scenarios[currentScenarioIndex];

  scenarioTitleElement.textContent = scenario.title;
  scenarioTextElement.textContent = scenario.description;
  optionAButton.textContent = scenario.optionA.text;
  optionBButton.textContent = scenario.optionB.text;

  currentScenarioIndex = (currentScenarioIndex + 1) % scenarios.length;
}

// -------------------------------------------------------------
// 6) Event listeners
// -------------------------------------------------------------
optionAButton.addEventListener("click", function () {
  const scenarioIndexJustShown =
    (currentScenarioIndex - 1 + scenarios.length) % scenarios.length;
  const scenario = scenarios[scenarioIndexJustShown];
  
  applyScenarioEffects(scenario.optionA.effects);
  renderStats();
  loadNextScenario();
});

optionBButton.addEventListener("click", function () {
  const scenarioIndexJustShown =
    (currentScenarioIndex - 1 + scenarios.length) % scenarios.length;
  const scenario = scenarios[scenarioIndexJustShown];

  applyScenarioEffects(scenario.optionB.effects);
  renderStats();
  loadNextScenario();
});

// Initial paint
renderStats();
loadNextScenario();
