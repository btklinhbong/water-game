// --- STATE ---
let metrics = { fun: 50, intelligence: 35, health: 50, dehydrate: 15 };
let cardIndex = 0;
let waterFetchHours = 0;
let schoolSkipped = 0;
let gameEnded = false;

// --- FACTS ---
const facts = {
  fetch: "In Ethiopia, a typical water trip takes over 2 hours.",
  health: "Unsafe water causes thousands of preventable illnesses and deaths each year.",
  school: "In many countries, lack of clean water leads to lower school attendance, especially for girls.",
  fun: "Children who spend hours fetching water often miss out on play—play is crucial for learning, mental health, and happiness.",
  dehydrate: "Severe dehydration can cause serious illness and death. Clean water saves lives."
};

const statsList = [
  "771 million people lack access to clean water.",
  "Women and girls spend up to 200 million hours a day collecting water worldwide.",
  "Dirty water is the world's leading cause of child death.",
  "A child without clean water may miss school or get sick."
];

// --- SITUATION CARDS ---
const cards = [
  {
    text: "Family needs water, but you're tired. Will you fetch water?",
    left: { choice: "Delay fetching water (rest, but family uncomfortable)", barEffects: { health: +5, dehydrate: +15 }, water: 0, school: 0 },
    right: { choice: "Fetch water (lose energy, but family okay)", barEffects: { health: -8, dehydrate: -10 }, water: 2, school: 0, fact: facts.fetch }
  },
  {
    text: "Friends invite you to play while you need to fetch water.",
    left: { choice: "Skip friends, focus on chores.", barEffects: { fun: -15, intelligence: +3, dehydrate: +8 }, water: 2, school: 0 },
    right: { choice: "Play, delay chores.", barEffects: { fun: +12, intelligence: -5, dehydrate: +15 }, water: 0, school: 0, fact: facts.fun }
  },
  {
    text: "School exam today but bucket spilled: more water fetching needed?",
    left: { choice: "Skip school, fetch water again.", barEffects: { intelligence: -15, health: -5, dehydrate: -5 }, water: 3, school: 1, fact: facts.school },
    right: { choice: "Attend school, leave family thirsty.", barEffects: { intelligence: +10, health: -10, fun: 2, dehydrate: +25 }, water: 0, school: 0 }
  },
  {
    text: "End of day—you're thirsty, but have time to fetch water or rest/play.",
    left: {
      choice: "Sleep without water (risk illness, but keep free time)",
      barEffects: { health: -30, fun: +3, dehydrate: +35 },
      water: 0,
      school: 0,
      fact: facts.health
    },
    right: {
      choice: "Fetch water late at night (lose free time, but hydrate)",
      barEffects: { health: +5, fun: -8, intelligence: -3, dehydrate: -40 },
      water: 2,
      school: 0,
      fact: facts.dehydrate
    }
  }
];

// --- DISPLAY & CONTROLS ---
const barFun = document.getElementById('bar-fun');
const barInt = document.getElementById('bar-int');
const barHealth = document.getElementById('bar-health');
const barDehydrate = document.getElementById('bar-dehydrate');
const valFun = document.getElementById('val-fun');
const valInt = document.getElementById('val-int');
const valHealth = document.getElementById('val-health');
const valDehydrate = document.getElementById('val-dehydrate');
const cardArea = document.getElementById('card-area');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const resultArea = document.getElementById('result-area');
const factArea = document.getElementById('fact-area');

function getRandomFact() {
  const allFacts = [...Object.values(facts), ...statsList];
  return allFacts[Math.floor(Math.random() * allFacts.length)];
}

function updateBars() {
  barFun.style.width = metrics.fun + "%";
  barInt.style.width = metrics.intelligence + "%";
  barHealth.style.width = metrics.health + "%";
  barDehydrate.style.width = metrics.dehydrate + "%";
  valFun.textContent = metrics.fun + "%";
  valInt.textContent = metrics.intelligence + "%";
  valHealth.textContent = metrics.health + "%";
  valDehydrate.textContent = metrics.dehydrate + "%";
}

function clampBars() {
  metrics.intelligence = Math.min(metrics.intelligence, 90); // can't reach 100!
  Object.keys(metrics).forEach(key => {
    metrics[key] = Math.max(0, Math.min(metrics[key], 100));
  });
}

function showFact(fact) {
  if (fact) {
    factArea.innerHTML = `<em>${fact}</em>`;
    setTimeout(() => { factArea.innerHTML = ''; }, 3500);
  }
}

function renderCard() {
  if (gameEnded) return;
  if (cardIndex >= cards.length) {
    showEnding();
    return;
  }
  factArea.innerHTML = '';
  const card = cards[cardIndex];
  cardArea.innerHTML = `
    <div class="card">
      <div class="story-art" aria-hidden="true"><span class="story-art-badge">Scenario</span></div>
      <p class="story-text">${card.text}</p>
      <ul class="choice-list">
        <li><strong>Left:</strong> ${card.left.choice}</li>
        <li><strong>Right:</strong> ${card.right.choice}</li>
      </ul>
    </div>
  `;
}

function applyBarEffects(be, water, school, fact) {
  for (let key in be) metrics[key] += be[key] || 0;
  clampBars();
  updateBars();

  if (water) waterFetchHours += water;
  if (school) schoolSkipped += school;

  // Contextual & dynamic facts
  if (fact) showFact(fact);
  if (metrics.health <= 25) showFact(facts.health);
  if (schoolSkipped >= 2) showFact(facts.school);
  if (metrics.fun <= 15) showFact(facts.fun);
  if (metrics.dehydrate >= 80) showFact(facts.dehydrate);

  // End conditions
  if (metrics.health === 0) showBadEnding("health");
  else if (metrics.fun === 0) showBadEnding("fun");
  else if (metrics.dehydrate === 100) showBadEnding("dehydrate");
  else renderCard();
}

function showBadEnding(bar) {
  gameEnded = true;
  leftBtn.style.display = 'none';
  rightBtn.style.display = 'none';
  cardArea.innerHTML = '';
  resultArea.style.display = 'block';
  let msg = '';
  if (bar === "health") {
    msg = "Your health dropped to zero. Without enough water, daily life becomes impossible.";
  } else if (bar === "fun") {
    msg = "Fun dropped to zero. Children who spend hours fetching water often miss out on play and friendship.";
  } else if (bar === "dehydrate") {
    msg = "Severe dehydration can cause serious illness and death. Clean water saves lives.";
  }
  resultArea.innerHTML = `
    <div class="result-panel">
      <h2>Game Over</h2>
      <div class="result-content">
        <p>${msg}</p>
        <p>
          Imagine spending hours every day fetching water, instead of enjoying college life.<br>
          <a href="https://charitywater.org" target="_blank">Learn More</a>
        </p>
      </div>
      <button class="result-btn" onclick="location.reload()">Try Again</button>
    </div>
  `;
}

function showEnding() {
  gameEnded = true;
  leftBtn.style.display = 'none';
  rightBtn.style.display = 'none';
  cardArea.innerHTML = '';
  resultArea.style.display = 'block';
  const endingFact = getRandomFact();

  resultArea.innerHTML = `
    <div class="result-panel">
      <h2>Your Day</h2>
      <div class="result-content">
        <p>
          Fun: <strong>${metrics.fun}/100</strong><br>
          Intelligence: <strong>${metrics.intelligence}/100</strong><br>
          Health: <strong>${metrics.health}/100</strong><br>
          Dehydrate: <strong>${metrics.dehydrate}/100</strong>
        </p>
        <h3>Time spent fetching water:</h3>
        <div style="margin:10px 0">
          You: <span style="display:inline-block;border-radius:4px;width:${waterFetchHours*30}px;height:12px;background:#009bd1"></span> ${waterFetchHours} hours<br>
          Avg college student: <span style="display:inline-block;border-radius:4px;width:3px;height:12px;background:#77a8bb"></span> 0.1 hours<br>
          Child in Ethiopia: <span style="display:inline-block;border-radius:4px;width:90px;height:12px;background:#d12229"></span> 3 hours
        </div>
        <p>
          You spent <b>${waterFetchHours}</b> hours fetching water today. In reality, millions of students do this every day, limiting their time for school and fun.
        </p>
        <p><b>Ending Fact:</b> ${endingFact}</p>
      </div>
      <button class="result-btn" onclick="location.reload()">Play Again</button>
    </div>
  `;
}

leftBtn.addEventListener('click', function() {
  if (gameEnded) return;
  const card = cards[cardIndex];
  cardIndex++;
  applyBarEffects(card.left.barEffects, card.left.water, card.left.school, card.left.fact);
});
rightBtn.addEventListener('click', function() {
  if (gameEnded) return;
  const card = cards[cardIndex];
  cardIndex++;
  applyBarEffects(card.right.barEffects, card.right.water, card.right.school, card.right.fact);
});

// -- Start game --
renderCard();
updateBars();