// @ts-check

const BLOCK_SIZE = 40;
const BLOCK_SPEED = 2;
const ROW_BONUS = 100;
const BLOCK_BONUS = 20;
const HOLD_COST = -50;
const BOARD_WIDTH = 400;
const BOARD_HEIGHT = 800;

// Screen state variables are now managed in ui.js
let quit = false;
let hold = false;
let rowClear = false;

let classicColors = [
  "#00D4FF", // Bright cyan
  "#4A90E2", // Modern blue
  "#FF6B35", // Vibrant orange
  "#FFD93D", // Bright yellow
  "#6BCF7F", // Fresh green
  "#9B59B6", // Modern purple
  "#E74C3C", // Bright red
];

let newColors = [
  "#FF69B4", // Hot pink
  "#D2B48C", // Tan
  "#8B4513", // Saddle brown
  "#2E8B57", // Sea green
];

// Enhanced mode colors with better contrast
let modeColors = [
  "#FFFFFF", // Pure white
  "#2C3E50", // Dark blue-gray
  "#95A5A6", // Light gray
  "#34495E", // Darker blue-gray
  "#F8F9FA", // Very light gray
  "#BDC3C7", // Medium gray
  "#E8F4F8", // Light blue tint
  "#F0F8FF", // Alice blue
  "#F5F5DC", // Beige
  "#FFF8DC", // Cornsilk
];

let blocks = [];
let squares = [];
let currPoints = [];
let heldPoints = [];
let oldHeld = [];
let currBlock,
  heldBlock = null;
let bgColor, stripeColor;
let score = 0;
let health;
let mode = 0;

window.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    if (currBlock.leftX > 0) {
      currBlock.x -= BLOCK_SIZE;
    }
  } else if (event.key === "ArrowRight") {
    if (currBlock.rightX < BOARD_WIDTH) {
      currBlock.x += BLOCK_SIZE;
    }
  } else if (event.key === "ArrowUp") {
    if (currBlock.rotation < 3) {
      currBlock.rotation += 1;
    } else {
      currBlock.rotation = 0;
    }
  }
});

function startBoard() {
  let canvas = /** @type {HTMLCanvasElement} */ (
    document.getElementById("myCanvas")
  );
  let context = canvas.getContext("2d");
  if (context) {
    // Create gradient background for more visual appeal
    let gradient = context.createLinearGradient(0, 0, 0, BOARD_HEIGHT);
    gradient.addColorStop(0, "#2C3E50"); // Dark blue-gray at top
    gradient.addColorStop(0.35, "#34495E"); // Slightly lighter
    gradient.addColorStop(0.65, "#5D6D7E"); // Medium gray
    gradient.addColorStop(1, "#85929E"); // Light gray at bottom

    context.fillStyle = gradient;
    context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // Add subtle grid pattern with transparency
    context.strokeStyle = "rgba(255, 255, 255, 0.1)";
    context.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      context.beginPath();
      context.moveTo(i * BLOCK_SIZE, 0);
      context.lineTo(i * BLOCK_SIZE, BOARD_HEIGHT);
      context.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= 20; i++) {
      context.beginPath();
      context.moveTo(0, i * BLOCK_SIZE);
      context.lineTo(BOARD_WIDTH, i * BLOCK_SIZE);
      context.stroke();
    }
  }
}

function pushBlock() {
  let type = Math.floor(Math.random() * 10) + 1;
  let color = 0;
  let x = 0;
  let y = 0;
  let rightX = 0;
  let leftX = 0;
  let topY = 0;
  let bottomY = 0;
  let rot = 0;
  if (type == 1 || type == 4 || type == 9) {
    x = Math.floor(Math.random() * 8) * BLOCK_SIZE;
  } else {
    x = Math.floor(Math.random() * 6) * (BLOCK_SIZE / 2);
    while (x % 40 == 0) {
      x = Math.floor(Math.random() * 6) * (BLOCK_SIZE / 2);
    }
  }
  x += 40;
  x += BLOCK_SIZE;
  blocks.push({
    type: type,
    rotation: rot,
    color: color,
    x: x,
    y: y,
    leftX: leftX,
    rightX: rightX,
    topY: topY,
    bottomY: bottomY,
    down: false,
  });
  currBlock = blocks[blocks.length - 1];
}

function detectCollision(x, y) {
  for (let i = 0; i < squares.length; i++) {
    let s = squares[i];
    if (s.x == x && s.y == y + BLOCK_SIZE) {
      return true; // Collision detected
    }
  }
  return false; // No collision
}

function createBlock(block, blockPoints, type, x, y, color, rot) {
  if (type == 1) {
    block.color = classicColors[0];
    if (rot == 0) {
      blockPoints.push({ x: x - 80, y: y, color: color });
      blockPoints.push({ x: x - 40, y: y, color: color });
      blockPoints.push({ x: x, y: y, color: color });
      blockPoints.push({ x: x + 40, y: y, color: color });
      block.leftX = x - 80;
      block.rightX = x + 80;
      block.topY = y - 40;
      block.bottomY = y;
    } else if (rot == 1) {
      blockPoints.push({ x: x, y: y, color: color });
      blockPoints.push({ x: x, y: y - 40, color: color });
      blockPoints.push({ x: x, y: y + 40, color: color });
      blockPoints.push({ x: x, y: y + 80, color: color });
      block.leftX = x;
      block.rightX = x + 40;
      block.topY = y - 80;
      block.bottomY = y + 80;
    } else if (rot == 2) {
      blockPoints.push({ x: x - 80, y: y + 40, color: color });
      blockPoints.push({ x: x - 40, y: y + 40, color: color });
      blockPoints.push({ x: x, y: y + 40, color: color });
      blockPoints.push({ x: x + 40, y: y + 40, color: color });
      block.leftX = x - 80;
      block.rightX = x + 80;
      block.topY = y;
      block.bottomY = y + 40;
    } else if (rot == 3) {
      blockPoints.push({ x: x - 40, y: y, color: color });
      blockPoints.push({ x: x - 40, y: y - 40, color: color });
      blockPoints.push({ x: x - 40, y: y + 40, color: color });
      blockPoints.push({ x: x - 40, y: y + 80, color: color });
      block.leftX = x - 40;
      block.rightX = x;
      block.topY = y - 80;
      block.bottomY = y + 80;
    }
  } else if (type == 2) {
    block.color = classicColors[1];
    blockPoints.push({ x: x - 20, y: y + 20, color: color });
    if (rot == 0) {
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      blockPoints.push({ x: x - 60, y: y - 20, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      block.leftX = x - 60;
      block.rightX = x + 60;
      block.topY = y - 60;
      block.bottomY = y + 20;
    } else if (rot == 1) {
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      blockPoints.push({ x: x + 20, y: y - 20, color: color });
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      block.leftX = x - 20;
      block.rightX = x + 60;
      block.topY = y - 60;
      block.bottomY = y + 60;
    } else if (rot == 2) {
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      blockPoints.push({ x: x + 20, y: y + 60, color: color });
      block.leftX = x - 60;
      block.rightX = x + 60;
      block.topY = y - 20;
      block.bottomY = y + 60;
    } else if (rot == 3) {
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      blockPoints.push({ x: x - 60, y: y + 60, color: color });
      block.leftX = x - 60;
      block.rightX = x + 20;
      block.topY = y - 60;
      block.bottomY = y + 60;
    }
  } else if (type == 3) {
    block.color = classicColors[2];
    blockPoints.push({ x: x - 20, y: y + 20, color: color });
    if (rot == 0) {
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      blockPoints.push({ x: x + 20, y: y - 20, color: color });
      block.leftX = x - 60;
      block.rightX = x + 60;
      block.topY = y - 60;
      block.bottomY = y + 20;
    } else if (rot == 1) {
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      blockPoints.push({ x: x + 20, y: y + 60, color: color });
      block.leftX = x - 20;
      block.rightX = x + 60;
      block.topY = y - 60;
      block.bottomY = y + 60;
    } else if (rot == 2) {
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      blockPoints.push({ x: x - 60, y: y + 60, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      block.leftX = x - 60;
      block.rightX = x + 60;
      block.topY = y - 20;
      block.bottomY = y + 60;
    } else if (rot == 3) {
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      blockPoints.push({ x: x - 60, y: y - 20, color: color });
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      block.leftX = x - 60;
      block.rightX = x + 20;
      block.topY = y - 60;
      block.bottomY = y + 60;
    }
  } else if (type == 4) {
    block.color = classicColors[3];
    blockPoints.push({ x: x - 40, y: y, color: color });
    blockPoints.push({ x: x - 40, y: y + 40, color: color });
    blockPoints.push({ x: x, y: y, color: color });
    blockPoints.push({ x: x, y: y + 40, color: color });
    block.leftX = x - 40;
    block.rightX = x + 40;
    block.topY = y - 40;
    block.bottomY = y + 40;
  } else if (type == 5) {
    block.color = classicColors[4];
    blockPoints.push({ x: x - 20, y: y + 20, color: color });
    if (rot == 0) {
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      blockPoints.push({ x: x + 20, y: y - 20, color: color });
      block.leftX = x - 60;
      block.rightX = x + 60;
      block.topY = y - 60;
      block.bottomY = y + 20;
    } else if (rot == 1) {
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      blockPoints.push({ x: x + 20, y: y + 60, color: color });
      block.leftX = x - 20;
      block.rightX = x + 60;
      block.topY = y - 60;
      block.bottomY = y + 60;
    } else if (rot == 2) {
      blockPoints.push({ x: x - 60, y: y + 60, color: color });
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      block.leftX = x - 60;
      block.rightX = x + 60;
      block.topY = y - 20;
      block.bottomY = y + 60;
    } else if (rot == 3) {
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      blockPoints.push({ x: x - 60, y: y - 20, color: color });
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      block.leftX = x - 60;
      block.rightX = x + 20;
      block.topY = y - 60;
      block.bottomY = y + 60;
    }
  } else if (type == 6) {
    block.color = classicColors[5];
    blockPoints.push({ x: x - 20, y: y + 20, color: color });
    if (rot == 0) {
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      block.leftX = x - 60;
      block.rightX = x + 60;
      block.topY = y - 60;
      block.bottomY = y + 20;
    } else if (rot == 1) {
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      block.leftX = x - 20;
      block.rightX = x + 60;
      block.topY = y - 60;
      block.bottomY = y + 60;
    } else if (rot == 2) {
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      block.leftX = x - 60;
      block.rightX = x + 60;
      block.topY = y - 20;
      block.bottomY = y + 60;
    } else if (rot == 3) {
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      block.leftX = x - 60;
      block.rightX = x + 20;
      block.topY = y - 60;
      block.bottomY = y + 60;
    }
  } else if (type == 7) {
    block.color = classicColors[6];
    blockPoints.push({ x: x - 20, y: y + 20, color: color });
    if (rot == 0) {
      blockPoints.push({ x: x - 60, y: y - 20, color: color });
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      block.leftX = x - 60;
      block.rightX = x + 60;
      block.topY = y - 60;
      block.bottomY = y + 20;
    } else if (rot == 1) {
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      blockPoints.push({ x: x + 20, y: y - 20, color: color });
      block.leftX = x - 20;
      block.rightX = x + 60;
      block.topY = y - 60;
      block.bottomY = y + 60;
    } else if (rot == 2) {
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      blockPoints.push({ x: x + 20, y: y + 60, color: color });
      block.leftX = x - 60;
      block.rightX = x + 60;
      block.topY = y - 20;
      block.bottomY = y + 60;
    } else if (rot == 3) {
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      blockPoints.push({ x: x - 60, y: y + 60, color: color });
      block.leftX = x - 60;
      block.rightX = x + 20;
      block.topY = y - 60;
      block.bottomY = y + 60;
    }
  } else if (type == 8) {
    block.color = newColors[0];
    blockPoints.push({ x: x - 20, y: y + 20, color: color });
    block.leftX = x - 20;
    block.rightX = x + 20;
    block.topY = y - 20;
    block.bottomY = y + 20;
  } else if (type == 9) {
    block.color = newColors[1];
    if (rot == 0) {
      blockPoints.push({ x: x - 40, y: y, color: color });
      blockPoints.push({ x: x, y: y, color: color });
      block.leftX = x - 40;
      block.rightX = x + 40;
      block.topY = y - 40;
      block.bottomY = y;
    } else if (rot == 1) {
      blockPoints.push({ x: x, y: y, color: color });
      blockPoints.push({ x: x, y: y + 40, color: color });
      block.leftX = x;
      block.rightX = x + 40;
      block.topY = y - 40;
      block.bottomY = y + 40;
    } else if (rot == 2) {
      blockPoints.push({ x: x - 40, y: y + 40, color: color });
      blockPoints.push({ x: x, y: y + 40, color: color });
      block.leftX = x - 40;
      block.rightX = x + 40;
      block.topY = y;
      block.bottomY = y + 40;
    } else if (rot == 3) {
      blockPoints.push({ x: x - 40, y: y, color: color });
      blockPoints.push({ x: x - 40, y: y + 40, color: color });
      block.leftX = x - 40;
      block.rightX = x;
      block.topY = y - 40;
      block.bottomY = y + 40;
    }
  } else if (type == 10) {
    block.color = newColors[2];
    blockPoints.push({ x: x - 20, y: y + 20, color: color });
    if (rot == 1) {
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      block.leftX = x - 20;
      block.rightX = x + 60;
      block.topY = y - 60;
      block.bottomY = y + 20;
    } else if (rot == 0) {
      blockPoints.push({ x: x - 20, y: y - 20, color: color });
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      block.leftX = x - 60;
      block.rightX = x + 20;
      block.topY = y - 60;
      block.bottomY = y + 20;
    } else if (rot == 2) {
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      blockPoints.push({ x: x - 60, y: y + 20, color: color });
      block.leftX = x - 60;
      block.rightX = x + 20;
      block.topY = y - 20;
      block.bottomY = y + 60;
    } else if (rot == 3) {
      blockPoints.push({ x: x - 20, y: y + 60, color: color });
      blockPoints.push({ x: x + 20, y: y + 20, color: color });
      block.leftX = x - 20;
      block.rightX = x + 60;
      block.topY = y - 20;
      block.bottomY = y + 60;
    }
  }
}

function drawHoldPreview() {
  const previewCanvas = document.getElementById("hold-preview");
  if (!previewCanvas) {
    console.log("Preview canvas not found!");
    return;
  }

  const previewContext = previewCanvas.getContext("2d");

  // Clear the preview canvas
  previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  // If there's no held block, show empty preview
  if (!heldBlock || heldPoints.length === 0) {
    previewContext.fillStyle = "rgba(255, 255, 255, 0.3)";
    previewContext.font = "18px Arial";
    previewContext.textAlign = "center";
    previewContext.fillText(
      "No piece held",
      previewCanvas.width / 2,
      previewCanvas.height / 2
    );
    return;
  }

  // Calculate center position for the preview using actual canvas size
  const previewSize = previewCanvas.width; // Now 240 instead of 160

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

    // Use the same color logic as the main game
    let fillColor, strokeColor;
    if (mode == 0) {
      // Classic mode - use original colors
      fillColor = point.color;
      strokeColor = "rgba(255, 255, 255, 0.5)";
    } else if (mode == 1) {
      // Light mode - use mode colors
      fillColor = modeColors[0];
      strokeColor = "rgba(0, 0, 0, 0.4)";
    } else if (mode == 2) {
      // Dark mode - use mode colors
      fillColor = modeColors[1];
      strokeColor = modeColors[2];
    }

    // Draw the block with enhanced styling
    previewContext.fillStyle = fillColor;
    previewContext.strokeStyle = strokeColor;
    previewContext.lineWidth = 2;

    const blockSize = BLOCK_SIZE * scale;
    previewContext.fillRect(x, y, blockSize, blockSize);
    previewContext.strokeRect(x, y, blockSize, blockSize);

    // Add a subtle highlight
    previewContext.fillStyle = "rgba(255, 255, 255, 0.2)";
    previewContext.fillRect(x, y, blockSize, blockSize * 0.3);
  });
}

function game() {
  function drawBoard(context) {
    // Create a subtle gradient background based on mode
    let gradient = context.createLinearGradient(0, 0, 0, canvas.height);

    if (mode == 2) {
      // Dark mode - deep gradients
      gradient.addColorStop(0, "#1a1a1a");
      gradient.addColorStop(0.5, "#2d2d2d");
      gradient.addColorStop(1, "#404040");
      bgColor = "#1a1a1a";
      stripeColor = "rgba(255, 255, 255, 0.08)";
    } else if (mode == 1) {
      // Light mode - classic gradient
      gradient.addColorStop(0, "#2C3E50"); // Dark blue-gray at top
      gradient.addColorStop(0.35, "#34495E"); // Slightly lighter
      gradient.addColorStop(0.65, "#5D6D7E"); // Medium gray
      gradient.addColorStop(1, "#85929E"); // Light gray at bottom
      bgColor = "#2C3E50";
      stripeColor = "rgba(255, 255, 255, 0.15)";
    } else {
      // Classic mode - plain black background
      gradient.addColorStop(0, "#000000");
      gradient.addColorStop(1, "#000000");
      bgColor = "#000000";
      stripeColor = "rgba(255, 255, 255, 0.2)";
    }

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid with improved styling and transparency
    context.strokeStyle = stripeColor;
    context.lineWidth = 0.8;

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      context.beginPath();
      context.moveTo(i * BLOCK_SIZE, 0);
      context.lineTo(i * BLOCK_SIZE, canvas.height);
      context.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i <= 20; i++) {
      context.beginPath();
      context.moveTo(0, i * BLOCK_SIZE);
      context.lineTo(canvas.width, i * BLOCK_SIZE);
      context.stroke();
    }
  }

  function drawBlock(context, x, y) {
    context.lineWidth = 0.5;
    if (mode == 0) {
      context.strokeStyle = "rgba(255, 255, 255, 0.3)"; // White border for black background
    } else if (mode == 1) {
      context.strokeStyle = "rgba(0, 0, 0, 0.4)"; // Dark border for better contrast
      context.fillStyle = modeColors[0];
    } else if (mode == 2) {
      context.strokeStyle = modeColors[2];
      context.fillStyle = modeColors[1];
    }
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + BLOCK_SIZE, y);
    context.lineTo(x + BLOCK_SIZE, y - BLOCK_SIZE);
    context.lineTo(x, y - BLOCK_SIZE);
    context.closePath();
    context.fill();
    context.stroke();
  }

  function chooseBlock(context) {
    for (let i = 0; i < squares.length; i++) {
      let s = squares[i];
      context.fillStyle = s.color;
      drawBlock(context, s.x, s.y);
    }
    for (let j = 0; j < currPoints.length; j++) {
      let c = currPoints[j];
      context.fillStyle = c.color;
      drawBlock(context, c.x, c.y);
    }
  }

  // Create a canvas element
  let canvas = /** @type {HTMLCanvasElement} */ (
    document.getElementById("myCanvas")
  );
  let context = canvas.getContext("2d");

  drawBoard(context);

  currPoints = [];
  createBlock(
    currBlock,
    currPoints,
    currBlock.type,
    currBlock.x,
    currBlock.y,
    currBlock.color,
    currBlock.rotation
  );
  chooseBlock(context);

  // Draw the hold preview only when gameplay UI is shown
  if (gameScreen && gameplayUIShown) {
    drawHoldPreview();
  }

  if (currBlock.bottomY >= BOARD_HEIGHT) {
    currBlock.down = true;
  }

  for (let i = 0; i < currPoints.length; i++) {
    let c = currPoints[i];
    let x = c.x;
    let y = c.y;
    if (detectCollision(x, y)) {
      currBlock.down = true;
      break;
    }
  }

  if (currBlock.down) {
    if (currBlock.topY <= 0) {
      quit = true;
    }
    score += BLOCK_BONUS;
    for (let i = 0; i < currPoints.length; i++) {
      squares.push(currPoints[i]);
    }
    currPoints = [];
    pushBlock();
  } else {
    currPoints = [];
    currBlock.y += BLOCK_SPEED;
  }

  for (let i = 1; i < 21; i++) {
    let rowBlocks = [];
    squares.forEach(function (s) {
      if (s.y == i * BLOCK_SIZE) {
        rowBlocks.push(s);
      }
      if (rowBlocks.length == 10) {
        let posY = rowBlocks[0].y;
        squares = squares.filter((s) => !rowBlocks.includes(s));
        squares.forEach(function (s) {
          if (s.y < posY) {
            s.y += BLOCK_SIZE;
          }
        });
        rowBlocks = [];
        score += ROW_BONUS;
        rowClear = true;
      }
    });
  }

  if (gameScreen) {
    window.requestAnimationFrame(game);
  }
}
