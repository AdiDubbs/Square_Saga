// @ts-check

const BLOCK_SIZE = 40;
const FALL_SPEED = 60; // pixels per second
const MAX_FRAME_TIME = 50; // ms
// Points for clearing 0, 1, 2, 3 or 4 lines at once.
const LINE_CLEAR_POINTS = [0, 100, 300, 500, 800];
const BLOCK_BONUS = 20;
const HOLD_COST = -50;
const HOLD_HEAL = 50;
const MODE_OBJECTIVE = 2000;
const BOARD_WIDTH = 400;
const BOARD_HEIGHT = 800;

// Screen state variables are now managed in ui.js
let quit = false;
let hold = false;

// Each piece type's colour (used in Classic mode) and the cells of its four
// rotations, as [x, y] offsets from the piece's pivot. A cell's x is its left
// edge and its y is its bottom edge. Index 0 is unused; types are 1-10.
const PIECES = [
  null,
  // 1: I
  {
    color: "#00D4FF",
    rotations: [
      [[-80, 0], [-40, 0], [0, 0], [40, 0]],
      [[0, 0], [0, -40], [0, 40], [0, 80]],
      [[-80, 40], [-40, 40], [0, 40], [40, 40]],
      [[-40, 0], [-40, -40], [-40, 40], [-40, 80]],
    ],
  },
  // 2: J
  {
    color: "#4A90E2",
    rotations: [
      [[-20, 20], [-60, 20], [-60, -20], [20, 20]],
      [[-20, 20], [-20, -20], [20, -20], [-20, 60]],
      [[-20, 20], [-60, 20], [20, 20], [20, 60]],
      [[-20, 20], [-20, -20], [-20, 60], [-60, 60]],
    ],
  },
  // 3: L
  {
    color: "#FF6B35",
    rotations: [
      [[-20, 20], [-60, 20], [20, 20], [20, -20]],
      [[-20, 20], [-20, -20], [-20, 60], [20, 60]],
      [[-20, 20], [-60, 20], [-60, 60], [20, 20]],
      [[-20, 20], [-20, -20], [-60, -20], [-20, 60]],
    ],
  },
  // 4: O
  {
    color: "#FFD93D",
    rotations: [
      [[-40, 0], [-40, 40], [0, 0], [0, 40]],
      [[-40, 0], [-40, 40], [0, 0], [0, 40]],
      [[-40, 0], [-40, 40], [0, 0], [0, 40]],
      [[-40, 0], [-40, 40], [0, 0], [0, 40]],
    ],
  },
  // 5: S
  {
    color: "#6BCF7F",
    rotations: [
      [[-20, 20], [-60, 20], [-20, -20], [20, -20]],
      [[-20, 20], [-20, -20], [20, 20], [20, 60]],
      [[-20, 20], [-60, 60], [-20, 60], [20, 20]],
      [[-20, 20], [-60, 20], [-60, -20], [-20, 60]],
    ],
  },
  // 6: T
  {
    color: "#9B59B6",
    rotations: [
      [[-20, 20], [-60, 20], [20, 20], [-20, -20]],
      [[-20, 20], [-20, -20], [20, 20], [-20, 60]],
      [[-20, 20], [-60, 20], [20, 20], [-20, 60]],
      [[-20, 20], [-20, -20], [-20, 60], [-60, 20]],
    ],
  },
  // 7: Z
  {
    color: "#E74C3C",
    rotations: [
      [[-20, 20], [-60, -20], [-20, -20], [20, 20]],
      [[-20, 20], [-20, 60], [20, 20], [20, -20]],
      [[-20, 20], [-60, 20], [-20, 60], [20, 60]],
      [[-20, 20], [-20, -20], [-60, 20], [-60, 60]],
    ],
  },
  // 8: single cell
  {
    color: "#FF69B4",
    rotations: [
      [[-20, 20]],
      [[-20, 20]],
      [[-20, 20]],
      [[-20, 20]],
    ],
  },
  // 9: domino
  {
    color: "#D2B48C",
    rotations: [
      [[-40, 0], [0, 0]],
      [[0, 0], [0, 40]],
      [[-40, 40], [0, 40]],
      [[-40, 0], [-40, 40]],
    ],
  },
  // 10: 3-cell L
  {
    color: "#8B4513",
    rotations: [
      [[-20, 20], [-20, -20], [-60, 20]],
      [[-20, 20], [-20, -20], [20, 20]],
      [[-20, 20], [-20, 60], [20, 20]],
      [[-20, 20], [-20, 60], [-60, 20]],
    ],
  },
];

// Board and piece colours per mode (0 Classic, 1 Light, 2 Dark). A null
// pieceFill or holdFill means each piece keeps its own colour.
const PALETTES = [
  {
    boardFill: "rgba(39, 48, 73, 1)",
    gridMajor: "rgba(245, 231, 201, 0.16)",
    gridMinor: "rgba(245, 231, 201, 0.08)",
    pieceFill: null,
    pieceStroke: "rgba(236, 226, 205, 0.34)",
    holdFill: null,
    holdStroke: "rgba(245, 224, 187, 0.52)",
    holdEmpty: "rgba(244, 227, 196, 0.66)",
  },
  {
    boardFill: "rgba(58, 68, 96, 1)",
    gridMajor: "rgba(244, 236, 214, 0.18)",
    gridMinor: "rgba(244, 236, 214, 0.09)",
    pieceFill: "rgba(191, 182, 163, 0.96)",
    pieceStroke: "rgba(241, 232, 211, 0.36)",
    holdFill: "rgba(199, 189, 170, 0.94)",
    holdStroke: "rgba(238, 227, 203, 0.36)",
    holdEmpty: "rgba(218, 209, 188, 0.56)",
  },
  {
    boardFill: "rgba(29, 36, 52, 1)",
    gridMajor: "rgba(159, 177, 206, 0.18)",
    gridMinor: "rgba(159, 177, 206, 0.09)",
    pieceFill: "rgba(95, 110, 132, 0.95)",
    pieceStroke: "rgba(188, 203, 228, 0.34)",
    holdFill: "rgba(102, 118, 140, 0.95)",
    holdStroke: "rgba(177, 194, 220, 0.34)",
    holdEmpty: "rgba(138, 154, 179, 0.5)",
  },
];

const UI_FONT = "\"Plus Jakarta Sans\", sans-serif";

function getModePalette() {
  return PALETTES[mode];
}

let squares = [];
let currPoints = [];
let heldPoints = [];
let currBlock,
  heldBlock = null;
let score = 0;
let enemyHealth = MODE_OBJECTIVE;
let mode = 0;
let gameLoopRunning = false;
let gameLoopFrame = null;
let lastFrameTime = null;
let fallProgress = 0;

function startGameLoop() {
  if (gameLoopRunning) {
    return;
  }
  gameLoopRunning = true;
  lastFrameTime = null;
  fallProgress = 0;
  gameLoopFrame = window.requestAnimationFrame(game);
}

function stopGameLoop() {
  gameLoopRunning = false;
  if (gameLoopFrame !== null) {
    window.cancelAnimationFrame(gameLoopFrame);
    gameLoopFrame = null;
  }
}

// Player input actions, shared by the keyboard and the on-screen touch controls.
// Each one is a no-op unless a game is active and a piece is falling.
function canControlPiece() {
  return typeof gameScreen !== "undefined" && gameScreen && !!currBlock;
}

function moveLeft() {
  if (!canControlPiece()) {
    return;
  }
  if (isValidBlockState(currBlock, currBlock.x - BLOCK_SIZE, currBlock.y, currBlock.rotation)) {
    currBlock.x -= BLOCK_SIZE;
  }
}

function moveRight() {
  if (!canControlPiece()) {
    return;
  }
  if (isValidBlockState(currBlock, currBlock.x + BLOCK_SIZE, currBlock.y, currBlock.rotation)) {
    currBlock.x += BLOCK_SIZE;
  }
}

function rotatePiece() {
  if (!canControlPiece()) {
    return;
  }
  const nextRotation = currBlock.rotation < 3 ? currBlock.rotation + 1 : 0;
  if (isValidBlockState(currBlock, currBlock.x, currBlock.y, nextRotation)) {
    currBlock.rotation = nextRotation;
  }
}

function softDrop() {
  if (!canControlPiece()) {
    return;
  }
  const dropY = currBlock.y + BLOCK_SIZE;
  if (isValidBlockState(currBlock, currBlock.x, dropY, currBlock.rotation)) {
    currBlock.y = dropY;
    return;
  }
  // Less than a full row of room left: settle onto the lowest valid position
  // so the next frame lands the piece instead of ignoring the key press.
  let landingY = currBlock.y;
  while (isValidBlockState(currBlock, currBlock.x, landingY + 1, currBlock.rotation)) {
    landingY += 1;
  }
  currBlock.y = landingY;
}

const KEY_ACTIONS = {
  ArrowLeft: moveLeft,
  ArrowRight: moveRight,
  ArrowUp: rotatePiece,
  ArrowDown: softDrop,
};

window.addEventListener("keydown", function (event) {
  const action = KEY_ACTIONS[event.key];
  if (!action || !canControlPiece()) {
    return;
  }
  event.preventDefault();
  action();
});

// On-screen touch controls: press-and-hold auto-repeats Left/Right/Down.
const TOUCH_REPEAT_DELAY_MS = 150;
const TOUCH_REPEAT_INTERVAL_MS = 60;
const TOUCH_ACTIONS = {
  left: moveLeft,
  right: moveRight,
  rotate: rotatePiece,
  down: softDrop,
};
const touchControlStops = [];

function stopAllTouchRepeats() {
  touchControlStops.forEach((stop) => stop());
}

function bindTouchControls() {
  const buttons = document.querySelectorAll("[data-touch-action]");
  buttons.forEach((button) => {
    const action = TOUCH_ACTIONS[button.getAttribute("data-touch-action")];
    if (!action) {
      return;
    }
    const repeats = button.hasAttribute("data-repeat");
    let delayTimer = null;
    let repeatTimer = null;
    let activePointerId = null;

    const stop = () => {
      window.clearTimeout(delayTimer);
      window.clearInterval(repeatTimer);
      delayTimer = null;
      repeatTimer = null;
      activePointerId = null;
      button.classList.remove("is-pressed");
    };
    touchControlStops.push(stop);

    button.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      // Keep focus where it is and suppress emulated mouse events / zoom.
      event.preventDefault();
      stop();
      activePointerId = event.pointerId;
      button.classList.add("is-pressed");
      action();
      if (repeats) {
        delayTimer = window.setTimeout(() => {
          repeatTimer = window.setInterval(() => {
            if (!canControlPiece()) {
              stop();
              return;
            }
            action();
          }, TOUCH_REPEAT_INTERVAL_MS);
        }, TOUCH_REPEAT_DELAY_MS);
      }
    });

    const release = (event) => {
      if (activePointerId === null || event.pointerId === activePointerId) {
        stop();
      }
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);

    // Keyboard activation (Enter/Space on a focused button) has detail 0.
    button.addEventListener("click", (event) => {
      if (event.detail === 0) {
        action();
      }
    });
    button.addEventListener("contextmenu", (event) => event.preventDefault());
  });

  window.addEventListener("blur", stopAllTouchRepeats);
  document.addEventListener("visibilitychange", stopAllTouchRepeats);
}

bindTouchControls();

// High-DPI canvas setup: each canvas's backing store matches its CSS size x
// devicePixelRatio, while drawing code keeps using logical coordinates.
const HOLD_PREVIEW_SIZE = 240;
const MAX_CANVAS_PIXELS = 8000000;
const SCALED_CANVASES = [
  { id: "myCanvas", width: BOARD_WIDTH, height: BOARD_HEIGHT },
  { id: "hold-preview", width: HOLD_PREVIEW_SIZE, height: HOLD_PREVIEW_SIZE },
];

function applyCanvasTransform(context, canvas, logicalWidth, logicalHeight) {
  context.setTransform(
    canvas.width / logicalWidth,
    0,
    0,
    canvas.height / logicalHeight,
    0,
    0
  );
}

function resizeCanvasBackingStore(canvas, logicalWidth, logicalHeight, devicePixelSize) {
  let width;
  let height;
  if (devicePixelSize) {
    width = devicePixelSize.inlineSize;
    height = devicePixelSize.blockSize;
  } else {
    const rect = canvas.getBoundingClientRect();
    const style = window.getComputedStyle(canvas);
    const dpr = window.devicePixelRatio || 1;
    const horizontalChrome =
      parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth) +
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const verticalChrome =
      parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth) +
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    width = Math.round((rect.width - horizontalChrome) * dpr);
    height = Math.round((rect.height - verticalChrome) * dpr);
  }

  // Hidden canvases report 0x0; keep the current backing store.
  if (!(width > 0 && height > 0)) {
    return;
  }

  const area = width * height;
  if (area > MAX_CANVAS_PIXELS) {
    const shrink = Math.sqrt(MAX_CANVAS_PIXELS / area);
    width = Math.floor(width * shrink);
    height = Math.floor(height * shrink);
  }

  if (canvas.width === width && canvas.height === height) {
    return;
  }

  // Resizing clears the canvas, so carry the current picture over (matters
  // when the game loop is stopped, e.g. the final board on the end screen).
  let snapshot = null;
  if (canvas.width > 0 && canvas.height > 0) {
    snapshot = document.createElement("canvas");
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    const snapshotContext = snapshot.getContext("2d");
    if (snapshotContext) {
      snapshotContext.drawImage(canvas, 0, 0);
    } else {
      snapshot = null;
    }
  }

  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  if (snapshot) {
    context.imageSmoothingEnabled = true;
    context.drawImage(snapshot, 0, 0, width, height);
  }
  applyCanvasTransform(context, canvas, logicalWidth, logicalHeight);
}

function resizeScaledCanvases() {
  SCALED_CANVASES.forEach((config) => {
    const canvas = document.getElementById(config.id);
    if (canvas) {
      resizeCanvasBackingStore(canvas, config.width, config.height, null);
    }
  });
}

let hasDevicePixelResizeObserver = false;

function setupCanvasResolution() {
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const config = SCALED_CANVASES.find((item) => item.id === entry.target.id);
        if (!config) {
          return;
        }
        let devicePixelSize =
          entry.devicePixelContentBoxSize && entry.devicePixelContentBoxSize[0];
        const cssSize = entry.contentBoxSize && entry.contentBoxSize[0];
        if (devicePixelSize && cssSize) {
          // Trust the exact device-pixel size only when it agrees with
          // CSS size x devicePixelRatio (some emulators report CSS pixels).
          const expected = cssSize.inlineSize * (window.devicePixelRatio || 1);
          if (Math.abs(devicePixelSize.inlineSize - expected) > 2) {
            devicePixelSize = null;
          } else {
            hasDevicePixelResizeObserver = true;
          }
        }
        resizeCanvasBackingStore(
          entry.target,
          config.width,
          config.height,
          devicePixelSize || null
        );
      });
    });
    SCALED_CANVASES.forEach((config) => {
      const canvas = document.getElementById(config.id);
      if (!canvas) {
        return;
      }
      try {
        observer.observe(canvas, { box: "device-pixel-content-box" });
      } catch (error) {
        observer.observe(canvas);
      }
    });
  }
  // Fallback for browsers without device-pixel-content-box observation
  // (which already reports zoom / devicePixelRatio changes).
  window.addEventListener("resize", () => {
    if (!hasDevicePixelResizeObserver) {
      resizeScaledCanvases();
    }
  });
  resizeScaledCanvases();
}

setupCanvasResolution();

function pushBlock(type = Math.floor(Math.random() * 10) + 1) {
  currBlock = createSpawnBlock(type);
  if (!isValidBlockState(currBlock, currBlock.x, currBlock.y, currBlock.rotation)) {
    quit = true;
  }
}

function getSpawnXs(type) {
  // Pivot x values (half-cell steps) where every rotation-0 cell sits on the grid inside the board.
  const spawnXs = [];
  for (let x = -BLOCK_SIZE * 2; x <= BOARD_WIDTH + BLOCK_SIZE * 2; x += BLOCK_SIZE / 2) {
    const points = getBlockPoints(type, x, 0, 0);
    const fits = points.every(
      (point) =>
        point.x % BLOCK_SIZE === 0 &&
        point.x >= 0 &&
        point.x <= BOARD_WIDTH - BLOCK_SIZE
    );
    if (points.length > 0 && fits) {
      spawnXs.push(x);
    }
  }
  return spawnXs;
}

function createSpawnBlock(type) {
  const spawnXs = getSpawnXs(type);
  return {
    type: type,
    rotation: 0,
    x: spawnXs[Math.floor(Math.random() * spawnXs.length)],
    y: 0,
    down: false,
  };
}

function squaresOverlap(ax, ay, bx, by) {
  const aLeft = ax;
  const aRight = ax + BLOCK_SIZE;
  const aTop = ay - BLOCK_SIZE;
  const aBottom = ay;

  const bLeft = bx;
  const bRight = bx + BLOCK_SIZE;
  const bTop = by - BLOCK_SIZE;
  const bBottom = by;

  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}

function hasToppedOut() {
  return squares.some((square) => square.y <= BLOCK_SIZE);
}

function isValidBlockState(block, x, y, rotation) {
  const testPoints = getBlockPoints(block.type, x, y, rotation);

  for (let i = 0; i < testPoints.length; i++) {
    const point = testPoints[i];

    if (point.x < 0 || point.x > BOARD_WIDTH - BLOCK_SIZE) {
      return false;
    }

    if (point.y > BOARD_HEIGHT) {
      return false;
    }

    for (let j = 0; j < squares.length; j++) {
      const settled = squares[j];
      if (squaresOverlap(point.x, point.y, settled.x, settled.y)) {
        return false;
      }
    }
  }

  return true;
}

function getBlockPoints(type, x, y, rotation) {
  const piece = PIECES[type];
  return piece.rotations[rotation].map(([dx, dy]) => ({
    x: x + dx,
    y: y + dy,
    color: piece.color,
  }));
}

function drawHoldPreview() {
  const previewCanvas = document.getElementById("hold-preview");
  if (!previewCanvas) {
    console.log("Preview canvas not found!");
    return;
  }

  const previewContext = previewCanvas.getContext("2d");
  // Layout math uses the logical preview size; the transform maps it onto
  // the (devicePixelRatio-scaled) backing store.
  const previewSize = HOLD_PREVIEW_SIZE;
  applyCanvasTransform(previewContext, previewCanvas, previewSize, previewSize);
  const palette = getModePalette();

  previewContext.fillStyle = palette.boardFill;
  previewContext.fillRect(0, 0, previewSize, previewSize);

  previewContext.lineWidth = 0.6;
  for (let i = 0; i <= previewSize / BLOCK_SIZE; i++) {
    previewContext.strokeStyle = i % 2 === 0 ? palette.gridMajor : palette.gridMinor;
    previewContext.beginPath();
    previewContext.moveTo(i * BLOCK_SIZE, 0);
    previewContext.lineTo(i * BLOCK_SIZE, previewSize);
    previewContext.stroke();
  }
  for (let i = 0; i <= previewSize / BLOCK_SIZE; i++) {
    previewContext.strokeStyle = i % 2 === 0 ? palette.gridMajor : palette.gridMinor;
    previewContext.beginPath();
    previewContext.moveTo(0, i * BLOCK_SIZE);
    previewContext.lineTo(previewSize, i * BLOCK_SIZE);
    previewContext.stroke();
  }

  previewContext.fillStyle = "rgba(0, 0, 0, 0.05)";
  previewContext.fillRect(0, 0, previewSize, previewSize);

  // If there's no held block, show empty preview
  if (!heldBlock || heldPoints.length === 0) {
    previewContext.fillStyle = palette.holdEmpty;
    previewContext.font = `600 16px ${UI_FONT}`;
    previewContext.textAlign = "center";
    previewContext.fillText(
      "No piece held",
      previewSize / 2,
      previewSize / 2
    );
    return;
  }

  // Find the bounds of the held piece
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  heldPoints.forEach((point) => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });

  const pieceWidth = maxX - minX + BLOCK_SIZE;
  const pieceHeight = maxY - minY + BLOCK_SIZE;

  // Calculate scale to fit in preview with some padding
  const padding = 30; // Increased padding for larger canvas
  const scaleX = (previewSize - padding) / pieceWidth;
  const scaleY = (previewSize - padding) / pieceHeight;
  const scale = Math.min(scaleX, scaleY, 1);

  // Calculate offset to center the piece
  const offsetX = (previewSize - pieceWidth * scale) / 2;
  const offsetY = (previewSize - pieceHeight * scale) / 2;

  // Draw each block of the held piece
  heldPoints.forEach((point) => {
    const x = (point.x - minX) * scale + offsetX;
    const y = (point.y - minY) * scale + offsetY;

    previewContext.fillStyle = palette.holdFill || point.color;
    previewContext.strokeStyle = palette.holdStroke;
    previewContext.lineWidth = 1.2;

    const blockSize = BLOCK_SIZE * scale;
    previewContext.fillRect(x, y, blockSize, blockSize);
    previewContext.strokeRect(x, y, blockSize, blockSize);

  });
}

function game(timestamp) {
  if (!gameLoopRunning) {
    return;
  }
  if (!gameScreen || quit) {
    stopGameLoop();
    return;
  }
  if (!currBlock) {
    stopGameLoop();
    return;
  }

  const now = typeof timestamp === "number" ? timestamp : performance.now();
  const dt = lastFrameTime === null ? 0 : Math.min(Math.max(now - lastFrameTime, 0), MAX_FRAME_TIME);
  lastFrameTime = now;
  fallProgress += (FALL_SPEED * dt) / 1000;
  const step = Math.floor(fallProgress);
  fallProgress -= step;

  function drawBoard(context) {
    // Re-apply the logical 400x800 transform every frame (other code may
    // reset it, e.g. to clear the canvas between runs).
    applyCanvasTransform(context, canvas, BOARD_WIDTH, BOARD_HEIGHT);
    const palette = getModePalette();
    context.fillStyle = palette.boardFill;
    context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    context.lineWidth = 0.8;

    for (let i = 0; i <= 10; i++) {
      context.strokeStyle = i % 2 === 0 ? palette.gridMajor : palette.gridMinor;
      context.beginPath();
      context.moveTo(i * BLOCK_SIZE, 0);
      context.lineTo(i * BLOCK_SIZE, BOARD_HEIGHT);
      context.stroke();
    }

    for (let i = 0; i <= 20; i++) {
      context.strokeStyle = i % 2 === 0 ? palette.gridMajor : palette.gridMinor;
      context.beginPath();
      context.moveTo(0, i * BLOCK_SIZE);
      context.lineTo(BOARD_WIDTH, i * BLOCK_SIZE);
      context.stroke();
    }
  }

  function drawBlockFill(context, x, y, color) {
    context.fillStyle = getModePalette().pieceFill || color;
    context.fillRect(x, y - BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }

  function drawBlockBorders(context, x, y) {
    context.strokeStyle = getModePalette().pieceStroke;
    context.lineWidth = 1.8;
    context.strokeRect(x, y - BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }

  function chooseBlock(context) {
    for (let i = 0; i < squares.length; i++) {
      let s = squares[i];
      drawBlockFill(context, s.x, s.y, s.color);
    }
    for (let j = 0; j < currPoints.length; j++) {
      let c = currPoints[j];
      drawBlockFill(context, c.x, c.y, c.color);
    }
    for (let i = 0; i < squares.length; i++) {
      const s = squares[i];
      drawBlockBorders(context, s.x, s.y);
    }
    for (let j = 0; j < currPoints.length; j++) {
      const c = currPoints[j];
      drawBlockBorders(context, c.x, c.y);
    }
  }

  // Create a canvas element
  let canvas = /** @type {HTMLCanvasElement} */ (
    document.getElementById("myCanvas")
  );
  let context = canvas.getContext("2d");

  drawBoard(context);

  currPoints = getBlockPoints(currBlock.type, currBlock.x, currBlock.y, currBlock.rotation);
  chooseBlock(context);

  // Draw the hold preview only when gameplay UI is shown
  if (gameScreen && gameplayUIShown) {
    drawHoldPreview();
  }

  currBlock.down = !isValidBlockState(
    currBlock,
    currBlock.x,
    currBlock.y + 1,
    currBlock.rotation
  );

  if (currBlock.down) {
    score += BLOCK_BONUS;
    for (let i = 0; i < currPoints.length; i++) {
      squares.push(currPoints[i]);
    }
    currPoints = [];

    const rowsToClear = [];
    for (let i = 1; i < 21; i++) {
      const rowY = i * BLOCK_SIZE;
      let rowCount = 0;
      for (let j = 0; j < squares.length; j++) {
        if (squares[j].y == rowY) {
          rowCount += 1;
        }
      }
      if (rowCount == 10) {
        rowsToClear.push(rowY);
      }
    }

    if (rowsToClear.length > 0) {
      squares = squares.filter((s) => !rowsToClear.includes(s.y));

      squares.forEach(function (s) {
        let rowsBelow = 0;
        for (let i = 0; i < rowsToClear.length; i++) {
          if (rowsToClear[i] > s.y) {
            rowsBelow += 1;
          }
        }
        if (rowsBelow > 0) {
          s.y += rowsBelow * BLOCK_SIZE;
        }
      });

      const linePoints = LINE_CLEAR_POINTS[Math.min(rowsToClear.length, LINE_CLEAR_POINTS.length - 1)];
      score += linePoints;
      // In Light and Dark modes only line clears damage the enemy.
      if (mode !== 0) {
        enemyHealth -= linePoints;
      }
    }

    if (mode !== 0 && enemyHealth <= 0) {
      quit = true;
    } else if (hasToppedOut()) {
      quit = true;
    } else {
      hold = false;
      pushBlock();
    }
  } else {
    currPoints = [];
    // Move one pixel at a time so the piece never skips past settled squares
    for (let moved = 0; moved < step; moved++) {
      if (!isValidBlockState(currBlock, currBlock.x, currBlock.y + 1, currBlock.rotation)) {
        break;
      }
      currBlock.y += 1;
    }
  }

  if (quit) {
    // The loop stops here, so redraw the settled board once; otherwise the
    // last frame (drawn before this landing's row clear) stays on screen.
    currPoints = [];
    drawBoard(context);
    chooseBlock(context);
  }

  if (gameScreen && !quit) {
    gameLoopFrame = window.requestAnimationFrame(game);
  } else {
    stopGameLoop();
  }
}
