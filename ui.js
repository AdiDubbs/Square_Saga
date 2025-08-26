// Screen state management
let startScreen = true;
let modeScreen = false;
let gameScreen = false;
let endScreen = false;
let instructionScreen = false;
let aboutScreen = false;
let gameplayUIShown = false;

// Screen management functions
function showStartMenu() {
  hideAllMenus();
  document.getElementById("start-menu").classList.remove("hidden");
}

function showModeMenu() {
  hideAllMenus();
  document.getElementById("mode-menu").classList.remove("hidden");
}

function showAboutMenu() {
  hideAllMenus();
  document.getElementById("about-menu").classList.remove("hidden");

  // Populate about content based on mode
  const aboutTitle = document.getElementById("about-title");
  const aboutContent = document.getElementById("about-content");

  if (mode === 0) {
    aboutTitle.textContent = "Classic Mode";
    aboutContent.innerHTML = `
            Welcome to the timeless challenge of Classic Mode!<br><br>
            Clear complete rows of blocks to earn points and prevent the stack from reaching the top.<br><br>
            Each row cleared grants points, with bonus points for clearing multiple rows at once.<br><br>
            Use the Hold feature strategically - store a piece for later, but beware the point penalty.<br><br>
            The game ends when blocks reach the top of the play area.<br><br>
            Can you achieve the highest score and master the falling blocks?
        `;
  } else if (mode === 1) {
    aboutTitle.textContent = "Light Mode";
    aboutContent.innerHTML = `
            The forces of darkness have unleashed the ancient demon Vortax upon the universe!<br><br>
            As a champion of light, you must clear rows of blocks to weaken this malevolent entity.<br><br>
            Each row cleared reduces Vortax's health, bringing you closer to victory.<br><br>
            Use the Hold feature wisely - while it gives you tactical advantage, it also grants Vortax a small amount of healing.<br><br>
            Victory is achieved when Vortax's health reaches zero.<br><br>
            The fate of countless worlds rests upon your shoulders. Will you be the universe's salvation?
        `;
  } else if (mode === 2) {
    aboutTitle.textContent = "Dark Mode";
    aboutContent.innerHTML = `
            The ancient Aura-Giving Tree stands as the final barrier between you and ultimate dominion!<br><br>
            As a master of shadows, you must clear rows of blocks to drain the tree's life-giving aura.<br><br>
            Each row cleared weakens the tree's protective aura, bringing you closer to total conquest.<br><br>
            Use the Hold feature strategically - while it provides tactical advantage, it also restores a small amount of the tree's aura.<br><br>
            Victory is achieved when the tree's aura is completely depleted.<br><br>
            The universe shall bow before the power of darkness. Will you be its conqueror?
        `;
  }
}

function showGameplayUI() {
  hideAllMenus();
  document.getElementById("gameplay-ui").classList.remove("hidden");

  // Reset hold button to initial state
  const holdButton = document.getElementById("hold-button");
  if (holdButton) {
    holdButton.textContent = "Hold";
  }

  updateGameplayUI();
}

function showEndMenu() {
  hideAllMenus();
  document.getElementById("end-menu").classList.remove("hidden");

  const endTitle = document.getElementById("end-title");
  const endMessage = document.getElementById("end-message");
  const endDescription = document.getElementById("end-description");
  const finalScore = document.getElementById("final-score");

  finalScore.textContent = `Score: ${score}`;

  if (mode !== 0) {
    if (score > 2000) {
      endTitle.textContent = "Victory!";
      endMessage.textContent = "You won!";
      endMessage.className = "end-message victory";

      if (mode === 1) {
        endDescription.innerHTML = `
                    Through your unwavering dedication to the light, you have achieved the impossible!<br><br>
                    The ancient demon Vortax has been banished back to the depths of darkness.<br><br>
                    The universe rejoices as peace and harmony are restored across all realms.
                `;
      } else if (mode === 2) {
        endDescription.innerHTML = `
                    With the power of darkness coursing through your veins, you have achieved ultimate conquest!<br><br>
                    The sacred Aura-Giving Tree has fallen, its light extinguished forever.<br><br>
                    The universe now bows before your might, and all realms shall know the power of shadows.
                `;
      }
    } else {
      endTitle.textContent = "Defeat";
      endMessage.textContent = "You lost...";
      endMessage.className = "end-message defeat";

      if (mode === 1) {
        endDescription.innerHTML = `
                    Though you fought valiantly for the light, the ancient demon Vortax proved too powerful.<br><br>
                    His malevolent presence now spreads across the universe, extinguishing hope wherever it goes.<br><br>
                    The forces of darkness have claimed another victory in their eternal war.
                `;
      } else if (mode === 2) {
        endDescription.innerHTML = `
                    Despite your mastery of shadows, the sacred Aura-Giving Tree's resilience proved unbreakable.<br><br>
                    Its ancient power continues to protect the universe, keeping the forces of darkness at bay.<br><br>
                    The light endures, and your conquest remains incomplete.
                `;
      }
    }
  } else {
    endTitle.textContent = "Classic Challenge Complete";
    endMessage.textContent = "Your block-mastering journey has ended";
    endMessage.className = "end-message";
    endDescription.innerHTML = `
                    You've faced the timeless challenge of falling blocks and emerged victorious!<br><br>
                    Your strategic thinking and quick reflexes have proven your mastery.<br><br>
                    Ready to push your skills even further?
                `;
  }
}

function hideAllMenus() {
  const menus = [
    "start-menu",
    "mode-menu",
    "about-menu",
    "gameplay-ui",
    "end-menu",
  ];
  menus.forEach((menuId) => {
    document.getElementById(menuId).classList.add("hidden");
  });
}

// Game functions
function selectMode(selectedMode) {
  mode = selectedMode;
  aboutScreen = true;
  showAboutMenu();
}

function startGame() {
  gameScreen = true;
  aboutScreen = false;

  // Reset hold state for new game
  hold = false;
  heldBlock = null;
  heldPoints = [];

  showGameplayUI();
  pushBlock();
  game();
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
  gameplayUIShown = false;
  modeScreen = true;
  showModeMenu();
}

function holdBlock() {
  const holdButton = document.getElementById("hold-button");

  if (hold) {
    // Retrieve the held piece
    currBlock = heldBlock;
    currPoints = [...heldPoints]; // Create a copy to avoid reference issues
    holdButton.textContent = "Hold";
    heldBlock = null;
    heldPoints = [];
    hold = false;
  } else {
    // Store the current piece
    hold = true;
    blocks.pop();
    heldBlock = { ...currBlock }; // Create a copy of the block

    // Recreate the points from the block data instead of copying currPoints
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

    holdButton.textContent = "Unhold";
    score += HOLD_COST;
    pushBlock();
  }
}

function updateGameplayUI() {
  const gameTitle = document.getElementById("game-title");
  const scoreDisplay = document.getElementById("score-display");
  const healthBar = document.getElementById("health-bar");
  const healthFill = document.getElementById("health-fill");
  const characterSection = document.getElementById("character-section");
  const characterImage = document.getElementById("character-image");
  const characterName = document.getElementById("character-name");
  const characterContainer = document.getElementById("character-container");

  if (mode === 0) {
    // Classic Mode
    gameTitle.textContent = "Classic Mode";
    scoreDisplay.textContent = score;
    healthBar.style.display = "none";
    characterSection.style.display = "none";
  } else if (mode === 1) {
    // Light Mode - Show monster (enemy)
    gameTitle.textContent = "Light Mode";
    const health = 2000 - score;
    scoreDisplay.textContent = health;
    healthBar.style.display = "block";
    healthFill.style.width = `${(health / 2000) * 100}%`;

    // Show monster character
    characterSection.style.display = "block";
    characterImage.src = "images/monster_saga.png";
    characterImage.alt = "Demon Vortax";
    characterName.textContent = "Ancient Demon Vortax";
    characterName.style.color = "#ff4444";

    // Set border color to match character theme (red for demon)
    characterContainer.style.border = "3px solid #ff4444";
    characterContainer.style.boxShadow = "0 0 25px rgba(255, 68, 68, 0.5)";
  } else if (mode === 2) {
    // Dark Mode - Show tree (enemy)
    gameTitle.textContent = "Dark Mode";
    const aura = 2000 - score;
    scoreDisplay.textContent = aura;
    healthBar.style.display = "block";
    healthFill.style.width = `${(aura / 2000) * 100}%`;

    // Show tree character
    characterSection.style.display = "block";
    characterImage.src = "images/tree_saga.png";
    characterImage.alt = "Aura-Giving Tree";
    characterName.textContent = "Sacred Aura-Giving Tree";
    characterName.style.color = "#4caf50";

    // Set border color to match character theme (green for tree)
    characterContainer.style.border = "3px solid #4caf50";
    characterContainer.style.boxShadow = "0 0 25px rgba(76, 175, 80, 0.5)";
  }
}

// Main menu system
function menus() {
  if (startScreen) {
    startScreen = false;
    showStartMenu();
  } else if (modeScreen) {
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

    if (score >= 2000 && mode !== 0) {
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

    // Start the game if it hasn't been started yet
    if (!blocks.length) {
      pushBlock();
      game();
    }
  } else if (endScreen) {
    endScreen = false;
    showEndMenu();
  }

  window.requestAnimationFrame(menus);
}

// Initialize the UI
menus();
