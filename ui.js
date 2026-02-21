// Screen state management
let modeScreen = false;
let gameScreen = false;
let endScreen = false;
let aboutScreen = false;
let gameplayUIShown = false;
const MENU_TRANSITION_MS = 220;
const MENU_IDS = ["mode-menu", "about-menu", "gameplay-ui", "end-menu"];
const OBJECTIVE_SCORE = typeof MODE_OBJECTIVE === "number" ? MODE_OBJECTIVE : 2000;
let activeMenuId = null;
let menuTransitionToken = 0;

function showMenu(menuId) {
  if (activeMenuId === menuId) return;

  const incoming = document.getElementById(menuId);
  if (!incoming) return;

  const transitionToken = ++menuTransitionToken;
  const outgoing = activeMenuId ? document.getElementById(activeMenuId) : null;

  incoming.classList.remove("hidden", "menu-leave");
  incoming.classList.add("menu-screen", "menu-enter");

  // Force style application before toggling to active for smooth transition.
  incoming.offsetHeight;

  requestAnimationFrame(() => {
    if (transitionToken !== menuTransitionToken) return;
    incoming.classList.add("menu-active");
    incoming.classList.remove("menu-enter");
  });

  if (outgoing && outgoing !== incoming) {
    outgoing.classList.remove("menu-active", "menu-enter");
    outgoing.classList.add("menu-leave");

    window.setTimeout(() => {
      if (!outgoing.classList.contains("menu-active")) {
        outgoing.classList.remove("menu-leave");
        outgoing.classList.add("hidden");
      }
    }, MENU_TRANSITION_MS);
  }

  activeMenuId = menuId;
}

function showModeMenu() {
  showMenu("mode-menu");
}

function showAboutMenu() {
  showMenu("about-menu");

  // Populate about content based on mode
  const aboutTitle = document.getElementById("about-title");
  const aboutGoalControls = document.getElementById("about-goal-controls");
  const aboutModeRules = document.getElementById("about-mode-rules");

  if (mode === 0) {
    aboutTitle.textContent = "Classic Mode";
    aboutGoalControls.innerHTML = `
      <ul>
        <li>In the old halls of the Grid, only patience and precision are remembered.</li>
        <li>Every falling shape is a trial, and every clean stack is a mark of mastery.</li>
        <li>No armies, no gods, no prophecy. Just you and the endless descent.</li>
      </ul>
    `;
    aboutModeRules.innerHTML = `
      <ul>
        <li>Clear full horizontal lines to score points and create space.</li>
        <li>Clear multiple lines at once for higher line-clear rewards.</li>
        <li>Using Hold costs points, so use it when it improves your board.</li>
        <li>The game ends when blocks reach the top of the board.</li>
      </ul>
    `;
  } else if (mode === 1) {
    aboutTitle.textContent = "Light Mode";
    aboutGoalControls.innerHTML = `
      <ul>
        <li>Vortax has risen from the shadowed deep and scorched the borders of the realm.</li>
        <li>You stand as the last champion of light, holding the line with will and discipline.</li>
        <li>Each clean formation is a strike against darkness in an unwinnable war made winnable.</li>
      </ul>
    `;
    aboutModeRules.innerHTML = `
      <ul>
        <li>Play by standard line-clear rules: clear full rows to score and keep the board open.</li>
        <li>Each line clear also reduces Vortax's health; win by reducing it to zero.</li>
        <li>Using Hold restores a small amount of Vortax's health in exchange for better piece control.</li>
        <li>You lose if the stack reaches the top before Vortax is defeated.</li>
      </ul>
    `;
  } else if (mode === 2) {
    aboutTitle.textContent = "Dark Mode";
    aboutGoalControls.innerHTML = `
      <ul>
        <li>The Sacred Aura-Giving Tree is the final bastion of the old light.</li>
        <li>You march beneath the banner of shadow, seeking to extinguish its ancient radiance.</li>
        <li>Order, tempo, and ruthless intent decide who writes the last chapter.</li>
      </ul>
    `;
    aboutModeRules.innerHTML = `
      <ul>
        <li>Standard line-clear rules apply: complete full rows to score and maintain space.</li>
        <li>Each line clear also lowers the tree's aura; win by draining aura to zero.</li>
        <li>Using Hold restores a portion of aura in exchange for tactical positioning.</li>
        <li>You lose if the board tops out before the tree's aura is depleted.</li>
      </ul>
    `;
  }
}

function showGameplayUI() {
  showMenu("gameplay-ui");

  // Reset hold button to initial state
  const holdButton = document.getElementById("hold-button");
  if (holdButton) {
    holdButton.textContent = "Hold";
  }

  updateGameplayUI();
}

function showEndMenu() {
  showMenu("end-menu");

  const endTitle = document.getElementById("end-title");
  const endMessage = document.getElementById("end-message");
  const endSummary = document.getElementById("end-summary");
  const endDescription = document.getElementById("end-description");
  const finalScore = document.getElementById("final-score");

  finalScore.textContent = `Score ${score}`;

  if (mode !== 0) {
    if (score >= OBJECTIVE_SCORE) {
      endTitle.textContent = "Battle Results";
      endMessage.textContent = "Victory";
      endMessage.className = "result-badge victory";
      endSummary.textContent = "Great run with solid control from start to finish.";

      if (mode === 1) {
        endDescription.innerHTML = `
                    You kept the board under control and beat Vortax before things got out of hand, managing your holds well and staying calm in the tight moments near the end.
                `;
      } else if (mode === 2) {
        endDescription.innerHTML = `
                    You kept steady pressure all game and drained the tree's aura at the right time, turning a close match into a clean finish with smart piece placement.
                `;
      }
    } else {
      endTitle.textContent = "Battle Results";
      endMessage.textContent = "Defeat";
      endMessage.className = "result-badge defeat";
      endSummary.textContent = "You were close, but couldn't finish the objective this time.";

      if (mode === 1) {
        endDescription.innerHTML = `
                    You were close, but couldn't defeat Vortax before the stack reached the top, and a few difficult piece drops in the final stretch made the difference.
                `;
      } else if (mode === 2) {
        endDescription.innerHTML = `
                    You were close, but couldn't destroy the Aura-Giving Tree before the board filled up, and the last few turns left too little space to recover.
                `;
      }
    }
  } else {
    endTitle.textContent = "Classic Results";
    endMessage.textContent = "Run Complete";
    endMessage.className = "result-badge";
    endSummary.textContent = score >= 1200
      ? "Excellent pace and clean stacking throughout the run."
      : "Solid attempt, and a few better line clears will raise your score quickly.";
    endDescription.innerHTML = `
                    Nice effort overall, and you're close to a much higher score if you keep the middle open more often and look for a few extra multi-line clears when the board is safe.
                `;
  }
}

function hideAllMenus() {
  MENU_IDS.forEach((menuId) => {
    document.getElementById(menuId).classList.add("hidden");
    document.getElementById(menuId).classList.remove("menu-active", "menu-enter", "menu-leave");
  });
  activeMenuId = null;
}

function applyModeTheme() {
  document.body.classList.remove("mode-classic", "mode-light", "mode-dark");
  if (mode === 0) {
    document.body.classList.add("mode-classic");
  } else if (mode === 1) {
    document.body.classList.add("mode-light");
  } else if (mode === 2) {
    document.body.classList.add("mode-dark");
  }
}

// Game functions
function selectMode(selectedMode) {
  mode = selectedMode;
  aboutScreen = true;
  applyModeTheme();
  showAboutMenu();
}

function startGame() {
  gameScreen = true;
  aboutScreen = false;

  // Reset hold state for new game
  hold = false;
  heldBlock = null;
  heldPoints = [];
  currBlock = null;

  showGameplayUI();
  pushBlock();
  startGameLoop();
}

function endGame() {
  quit = true;
}

function restartGame() {
  score = 0;
  heldBlock = null;
  heldPoints = [];
  hold = false; // Reset hold state
  blocks = [];
  squares = [];
  currPoints = [];
  currBlock = null;
  gameplayUIShown = false;
  stopGameLoop();
  modeScreen = true;
  showModeMenu();
}

function resetRunState() {
  score = 0;
  heldBlock = null;
  heldPoints = [];
  hold = false;
  blocks = [];
  squares = [];
  currPoints = [];
  currBlock = null;
  gameplayUIShown = false;
  endScreen = false;
  quit = false;
  stopGameLoop();
}

function fightAgain() {
  resetRunState();
  gameScreen = true;
  startGame();
}

function changeMode() {
  resetRunState();
  modeScreen = true;
  showModeMenu();
}

function holdBlock() {
  if (!gameScreen || !currBlock) {
    return;
  }

  const holdButton = document.getElementById("hold-button");
  const holdFeedback = document.getElementById("hold-feedback");
  score += HOLD_COST;

  if (!heldBlock) {
    heldBlock = { ...currBlock };
    heldBlock.rotation = 0;
    blocks.pop();
    pushBlock();
  } else {
    const swappedType = heldBlock.type;
    heldBlock = { ...currBlock };
    heldBlock.rotation = 0;
    spawnBlockOfType(swappedType);
  }

  heldPoints = [];
  createBlock(
    heldBlock,
    heldPoints,
    heldBlock.type,
    heldBlock.x,
    heldBlock.y,
    heldBlock.color,
    heldBlock.rotation
  );

  hold = true;
  if (holdButton) {
    holdButton.textContent = "Hold";
  }
  if (holdFeedback) {
    holdFeedback.classList.remove("show");
    holdFeedback.offsetHeight;
    holdFeedback.classList.add("show");
  }
}

function updateGameplayUI() {
  const gameTitle = document.getElementById("game-title");
  const objectiveLabel = document.getElementById("objective-label");
  const objectiveValue = document.getElementById("objective-value");
  const performanceLabel = document.getElementById("performance-label");
  const performanceValue = document.getElementById("performance-value");
  const healthBar = document.getElementById("health-bar");
  const healthFill = document.getElementById("health-fill");
  const characterSection = document.getElementById("character-section");
  const characterImage = document.getElementById("character-image");
  const characterName = document.getElementById("character-name");

  applyModeTheme();

  if (mode === 0) {
    // Classic Mode
    gameTitle.textContent = "Classic Mode";
    objectiveLabel.textContent = "Objective";
    objectiveValue.textContent = "Survive";
    performanceLabel.textContent = "Score";
    performanceValue.textContent = score;
    healthBar.style.display = "none";
    characterSection.style.display = "none";
  } else if (mode === 1) {
    // Light Mode - Show monster (enemy)
    gameTitle.textContent = "Light Mode";
    objectiveLabel.textContent = "Enemy Health";
    const health = Math.max(0, Math.min(OBJECTIVE_SCORE, OBJECTIVE_SCORE - score));
    const healthPercent = (health / OBJECTIVE_SCORE) * 100;
    objectiveValue.textContent = health;
    performanceLabel.textContent = "Score";
    performanceValue.textContent = score;
    healthBar.style.display = "block";
    healthFill.style.width = `${healthPercent}%`;

    // Show monster character
    characterSection.style.display = "block";
    characterImage.src = "assets/monster_saga.png";
    characterImage.alt = "Demon Vortax";
    characterName.textContent = "Ancient Demon Vortax";
  } else if (mode === 2) {
    // Dark Mode - Show tree (enemy)
    gameTitle.textContent = "Dark Mode";
    objectiveLabel.textContent = "Tree Aura";
    const aura = Math.max(0, Math.min(OBJECTIVE_SCORE, OBJECTIVE_SCORE - score));
    const auraPercent = (aura / OBJECTIVE_SCORE) * 100;
    objectiveValue.textContent = aura;
    performanceLabel.textContent = "Score";
    performanceValue.textContent = score;
    healthBar.style.display = "block";
    healthFill.style.width = `${auraPercent}%`;

    // Show tree character
    characterSection.style.display = "block";
    characterImage.src = "assets/tree_saga.png";
    characterImage.alt = "Aura-Giving Tree";
    characterName.textContent = "Sacred Aura-Giving Tree";
  }
}

// Main menu system
function menus() {
  if (modeScreen) {
    modeScreen = false;
    showModeMenu();
  } else if (aboutScreen) {
    aboutScreen = false;
    showAboutMenu();
  } else if (gameScreen) {
    // Show the gameplay UI screen only once
    if (!gameplayUIShown) {
      showGameplayUI();
      gameplayUIShown = true;
    }

    // Update the UI continuously (score, health bar, etc.)
    updateGameplayUI();

    if (score >= OBJECTIVE_SCORE && mode !== 0) {
      quit = true;
    }

    if (quit) {
      endScreen = true;
      gameScreen = false;
      hold = false;
      quit = false;
      gameplayUIShown = false;
      showEndMenu();
    }

  } else if (endScreen) {
    endScreen = false;
    showEndMenu();
  }

  window.requestAnimationFrame(menus);
}

// Initialize the UI
applyModeTheme();
const initialMenu = document.getElementById("mode-menu");
if (initialMenu) {
  initialMenu.classList.add("menu-active");
  activeMenuId = "mode-menu";
}
menus();
