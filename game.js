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

// Board and piece colours per mode (0 Classic, 1 Light, 2 Dark). The board
// is a softly lit well with a dot at each grid corner; pieces are bevelled
// stones. A null stone colour means each piece keeps its own colour.
const PALETTES = [
  {
    wellTop: "#2B3456",
    wellBottom: "#1E2540",
    wellGlow: 0.05,
    dot: "rgba(245, 231, 201, 0.16)",
    stone: null,
    stoneEdge: "rgba(255, 255, 255, 0.18)",
    stoneMark: "rgba(255, 255, 255, 0.22)",
    emptyText: "rgba(244, 227, 196, 0.66)",
  },
  {
    wellTop: "#3A4570",
    wellBottom: "#262E4D",
    wellGlow: 0.06,
    dot: "rgba(244, 236, 214, 0.18)",
    stone: "#D9CDB0",
    stoneEdge: "rgba(120, 96, 56, 0.35)",
    stoneMark: "rgba(120, 96, 56, 0.35)",
    emptyText: "rgba(218, 209, 188, 0.6)",
  },
  {
    wellTop: "#232733",
    wellBottom: "#15171E",
    wellGlow: 0.04,
    dot: "rgba(188, 203, 228, 0.14)",
    stone: "#7E8AA0",
    stoneEdge: "rgba(0, 0, 0, 0.35)",
    stoneMark: "rgba(0, 0, 0, 0.3)",
    emptyText: "rgba(138, 154, 179, 0.6)",
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

// Player input actions, shared by the keyboard and the board's touch gestures.
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

function hardDrop() {
  if (!canControlPiece()) {
    return;
  }
  let landingY = currBlock.y;
  while (isValidBlockState(currBlock, currBlock.x, landingY + 1, currBlock.rotation)) {
    landingY += 1;
  }
  currBlock.y = landingY;
}

// Touch gestures on the board: drag sideways to move a column at a time,
// drag down to drop a row at a time, flick down to drop all the way,
// swipe up to hold, tap to rotate.
const TAP_MAX_MOVE_PX = 10;
const TAP_MAX_MS = 280;
const FLICK_MAX_MS = 350;
const FLICK_MIN_CELLS = 2;

function bindBoardGestures() {
  const board = document.getElementById("myCanvas");
  if (!board) {
    return;
  }
  let gesture = null;

  board.addEventListener("pointerdown", (event) => {
    // Mouse play stays on the keyboard; gestures are for touch and pen.
    if (event.pointerType === "mouse" || !canControlPiece()) {
      return;
    }
    event.preventDefault();
    board.setPointerCapture(event.pointerId);
    gesture = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      anchorX: event.clientX,
      anchorY: event.clientY,
      startTime: performance.now(),
      moved: false,
    };
  });

  board.addEventListener("pointermove", (event) => {
    if (!gesture || event.pointerId !== gesture.id) {
      return;
    }
    const cell = board.clientWidth / (BOARD_WIDTH / BLOCK_SIZE);
    if (
      Math.abs(event.clientX - gesture.startX) > TAP_MAX_MOVE_PX ||
      Math.abs(event.clientY - gesture.startY) > TAP_MAX_MOVE_PX
    ) {
      gesture.moved = true;
    }
    while (event.clientX - gesture.anchorX >= cell) {
      moveRight();
      gesture.anchorX += cell;
    }
    while (gesture.anchorX - event.clientX >= cell) {
      moveLeft();
      gesture.anchorX -= cell;
    }
    // A slow downward drag lowers the piece one row per cell dragged.
    while (event.clientY - gesture.anchorY >= cell) {
      softDrop();
      gesture.anchorY += cell;
    }
  });

  const finish = (event) => {
    if (!gesture || event.pointerId !== gesture.id) {
      return;
    }
    const cell = board.clientWidth / (BOARD_WIDTH / BLOCK_SIZE);
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    const elapsed = performance.now() - gesture.startTime;
    const vertical = Math.abs(dy) > Math.abs(dx);

    if (event.type === "pointerup") {
      if (!gesture.moved && elapsed <= TAP_MAX_MS) {
        rotatePiece();
      } else if (vertical && elapsed <= FLICK_MAX_MS && dy >= FLICK_MIN_CELLS * cell) {
        hardDrop();
      } else if (vertical && elapsed <= FLICK_MAX_MS && -dy >= FLICK_MIN_CELLS * cell) {
        holdBlock();
      }
    }
    gesture = null;
  };
  board.addEventListener("pointerup", finish);
  board.addEventListener("pointercancel", finish);
  board.addEventListener("contextmenu", (event) => event.preventDefault());
}

bindBoardGestures();

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

  drawWell(previewContext, previewSize, previewSize, palette);

  // If there's no held block, show empty preview
  if (!heldBlock || heldPoints.length === 0) {
    previewContext.fillStyle = palette.emptyText;
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

  // Fit the piece with some padding; small pieces may grow up to 1.5x so
  // they stay readable in the small preview tile.
  const padding = 48;
  const scaleX = (previewSize - padding) / pieceWidth;
  const scaleY = (previewSize - padding) / pieceHeight;
  const scale = Math.min(scaleX, scaleY, 1.5);

  // Calculate offset to center the piece
  const offsetX = (previewSize - pieceWidth * scale) / 2;
  const offsetY = (previewSize - pieceHeight * scale) / 2;

  // Draw each block of the held piece
  heldPoints.forEach((point) => {
    const x = (point.x - minX) * scale + offsetX;
    const y = (point.y - minY) * scale + offsetY;

    drawStone(previewContext, x, y, BLOCK_SIZE * scale, point.color, palette);
  });
}

// The board's background: a vertical gradient, a soft central glow and a
// dot at each inner grid corner.
function drawWell(context, width, height, palette) {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, palette.wellTop);
  gradient.addColorStop(1, palette.wellBottom);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(
    width / 2, height * 0.38, width * 0.2,
    width / 2, height / 2, Math.max(width, height) * 0.65
  );
  glow.addColorStop(0, `rgba(255, 255, 255, ${palette.wellGlow})`);
  glow.addColorStop(1, "rgba(0, 0, 0, 0.28)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.fillStyle = palette.dot;
  for (let x = BLOCK_SIZE; x < width; x += BLOCK_SIZE) {
    for (let y = BLOCK_SIZE; y < height; y += BLOCK_SIZE) {
      context.beginPath();
      context.arc(x, y, 1.3, 0, Math.PI * 2);
      context.fill();
    }
  }
}

function drawBoard(context) {
  // Re-apply the logical 400x800 transform every frame (other code may
  // reset it, e.g. to clear the canvas between runs).
  applyCanvasTransform(context, context.canvas, BOARD_WIDTH, BOARD_HEIGHT);
  drawWell(context, BOARD_WIDTH, BOARD_HEIGHT, getModePalette());
}

// Lighten (amount > 0) or darken (amount < 0) a #rrggbb colour.
function shadeColor(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const channel = (c) =>
    Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount);
  return `rgb(${channel(value >> 16)}, ${channel((value >> 8) & 255)}, ${channel(value & 255)})`;
}

function stonePath(context, x, y, size, radius) {
  context.beginPath();
  if (context.roundRect) {
    context.roundRect(x, y, size, size, radius);
  } else {
    context.rect(x, y, size, size);
  }
}

// One bevelled stone with its top-left corner at (x, y): lit from above,
// a thin highlight along the top and a small carved ring in the middle.
function drawStone(context, x, y, size, color, palette) {
  const unit = size / BLOCK_SIZE;
  const inset = 1.5 * unit;
  const base = palette.stone || color;

  const gradient = context.createLinearGradient(0, y, 0, y + size);
  gradient.addColorStop(0, shadeColor(base, 0.28));
  gradient.addColorStop(0.5, base);
  gradient.addColorStop(1, shadeColor(base, -0.22));
  stonePath(context, x + inset, y + inset, size - inset * 2, 5 * unit);
  context.fillStyle = gradient;
  context.fill();
  context.strokeStyle = palette.stoneEdge;
  context.lineWidth = 1.2 * unit;
  context.stroke();

  context.beginPath();
  context.moveTo(x + 6 * unit, y + 4 * unit);
  context.lineTo(x + size - 6 * unit, y + 4 * unit);
  context.strokeStyle = "rgba(255, 255, 255, 0.45)";
  context.lineWidth = 1.4 * unit;
  context.stroke();

  context.beginPath();
  context.arc(x + size / 2, y + size / 2, 4.5 * unit, 0, Math.PI * 2);
  context.strokeStyle = palette.stoneMark;
  context.lineWidth = 1.2 * unit;
  context.stroke();
}

// Board squares store their bottom edge as y.
function drawBlock(context, x, y, color) {
  drawStone(context, x, y - BLOCK_SIZE, BLOCK_SIZE, color, getModePalette());
}

// A still Classic board for the idle view, before a Classic game starts.
const IDLE_BOARD = [
  "..........",
  "........I.",
  "J.......I.",
  "JJJ.SS..I.",
  "ZZ.SSTTTI.",
  "LZZOOQTLLL",
];
const IDLE_PIECE_TYPES = { I: 1, J: 2, L: 3, O: 4, S: 5, T: 6, Z: 7, Q: 8 };

function drawIdleBoard() {
  const canvas = document.getElementById("myCanvas");
  const context = canvas ? canvas.getContext("2d") : null;
  if (!context) {
    return;
  }
  drawBoard(context);
  const top = BOARD_HEIGHT - IDLE_BOARD.length * BLOCK_SIZE;
  const cells = [];
  IDLE_BOARD.forEach((row, r) => {
    row.split("").forEach((ch, c) => {
      const type = IDLE_PIECE_TYPES[ch];
      if (type) {
        cells.push({ x: c * BLOCK_SIZE, y: top + (r + 1) * BLOCK_SIZE, color: PIECES[type].color });
      }
    });
  });
  cells.forEach((cell) => drawBlock(context, cell.x, cell.y, cell.color));
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

  function chooseBlock(context) {
    squares.forEach((s) => drawBlock(context, s.x, s.y, s.color));
    currPoints.forEach((c) => drawBlock(context, c.x, c.y, c.color));
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
