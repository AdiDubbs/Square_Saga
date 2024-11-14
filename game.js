// @ts-check

const BLOCK_SIZE = 40;
const BLOCK_SPEED = 4;
const ROW_BONUS = 100;
const BLOCK_BONUS = 20;
const HOLD_COST = -50;
const BOARD_WIDTH = 400;
const BOARD_HEIGHT = 800;

let startScreen = true;
let modeScreen = false;
let gameScreen = false;
let endScreen = false;
let instructionScreen = false;
let aboutScreen = false;
let quit = false;
let hold = false;
let rowClear = false;

let classicColors = ['aqua', 'mediumblue', 'orange', 'yellow', 'limegreen', 'mediumpurple', 'red'];
let newColors = ['deeppink', 'tan', 'maroon', 'darkgreen'];
let modeColors = ['white', 'black', 'grey', 'dimgray'];
let blocks = [];
let squares = [];
let currPoints = [];
let heldPoints = [];
let oldHeld = [];
let currBlock, heldBlock;
let bgColor, stripeColor;
let score = 0;
let health;
let mode = 0;

window.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        if (currBlock.leftX > 0 ) {
            currBlock.x -= BLOCK_SIZE;
        }
    } else if (event.key === 'ArrowRight') {
        if (currBlock.rightX < BOARD_WIDTH) {
            currBlock.x += BLOCK_SIZE;
        }
    } else if (event.key === 'ArrowUp') {
        if (currBlock.rotation < 3) {
            currBlock.rotation += 1;
        } else {
            currBlock.rotation = 0;
        }
    }
});

function startBoard() {
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("myCanvas"));
    let context = canvas.getContext('2d');
    if (context) {

        // background
        context.fillStyle = modeColors[0];
        context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT * 7/20);
        context.fillStyle = classicColors[Math.floor(Math.random() * 7)];
        context.fillRect(0, BOARD_HEIGHT * 7/20, BOARD_WIDTH, BOARD_HEIGHT * 6/20);    
        context.fillStyle = modeColors[1];
        context.fillRect(0, BOARD_HEIGHT * 13/20, BOARD_WIDTH, BOARD_HEIGHT * 7/20);

        context.strokeStyle = modeColors[1];
        // strokes
        for (let i = 0; i < 10; i++) {
            context.strokeStyle = modeColors[1];
            context.beginPath();
            context.moveTo(i * BLOCK_SIZE, 0);
            context.lineTo(i * BLOCK_SIZE, BOARD_HEIGHT * 13/20);
            context.stroke();
            context.closePath();

            context.strokeStyle = modeColors[2];
            context.beginPath();
            context.moveTo(i * BLOCK_SIZE, BOARD_HEIGHT * 13/20);
            context.lineTo(i * BLOCK_SIZE, BOARD_HEIGHT);
            context.stroke();
            context.closePath();
        }

        for (let j = 0; j < 7; j++) {
            context.strokeStyle = modeColors[1];
            context.beginPath();
            context.moveTo(0, j * BLOCK_SIZE);
            context.lineTo(BOARD_WIDTH, j * BLOCK_SIZE);
            context.stroke();
            context.closePath();
        }
        for (let k = 0; k < 6; k++) {
            context.strokeStyle = modeColors[1];
            context.beginPath();
            context.moveTo(0, BOARD_HEIGHT * 7/20 + k * BLOCK_SIZE);
            context.lineTo(BOARD_WIDTH, BOARD_HEIGHT * 7/20 + k * BLOCK_SIZE);
            context.stroke();
            context.closePath();
        }
        for (let l = 0; l < 7; l++) {
            context.strokeStyle = modeColors[2];
            context.beginPath();
            context.moveTo(0, (BOARD_HEIGHT * 13/20) + (l * BLOCK_SIZE));
            context.lineTo(BOARD_WIDTH, (BOARD_HEIGHT * 13/20) + (l * BLOCK_SIZE));
            context.stroke();
            context.closePath();
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
    if ((type == 1) || (type == 4) || (type == 9)) {
        x = Math.floor(Math.random() * 8) * BLOCK_SIZE;
    } else {
        x = Math.floor(Math.random() * 6) * (BLOCK_SIZE/2);
        while (x % 40 == 0) {
            x = Math.floor(Math.random() * 6) * (BLOCK_SIZE/2);
        }
    }
    x += 40;
    x += BLOCK_SIZE;
    blocks.push({"type": type, "rotation": rot, "color": color, "x": x, "y": y, "leftX": leftX, "rightX": rightX, "topY": topY, "bottomY": bottomY, "down": false});
    currBlock = blocks[blocks.length - 1];
}

function detectCollision(x, y) {
    for (let i = 0; i < squares.length; i++) {
        let s = squares[i];
        if ((s.x == x) && (s.y == y + BLOCK_SIZE)) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

function createBlock(block, blockPoints, type, x, y, color, rot) {
    if (type == 1) {
        block.color = classicColors[0];
        if (rot == 0) {
            blockPoints.push({"x": x - 80, "y": y, "color": color});
            blockPoints.push({"x": x - 40, "y": y, "color": color});
            blockPoints.push({"x": x, "y": y , "color": color});
            blockPoints.push({"x": x + 40, "y": y, "color": color});
            block.leftX = x - 80;
            block.rightX = x + 80;
            block.topY = y - 40;
            block.bottomY = y;
        } else if (rot == 1) {
            blockPoints.push({"x": x, "y": y, "color": color});
            blockPoints.push({"x": x, "y": y - 40, "color": color});
            blockPoints.push({"x": x, "y": y + 40, "color": color});
            blockPoints.push({"x": x, "y": y + 80, "color": color});
            block.leftX = x;
            block.rightX = x + 40;
            block.topY = y - 80;
            block.bottomY = y + 80;
        } else if (rot == 2) {
            blockPoints.push({"x": x - 80, "y": y + 40, "color": color});
            blockPoints.push({"x": x - 40, "y": y + 40, "color": color});
            blockPoints.push({"x": x, "y": y + 40, "color": color});
            blockPoints.push({"x": x + 40, "y": y + 40, "color": color});
            block.leftX = x - 80;
            block.rightX = x + 80;
            block.topY = y;
            block.bottomY = y + 40;
        }  else if (rot == 3) {
            blockPoints.push({"x": x - 40, "y": y, "color": color});
            blockPoints.push({"x": x - 40, "y": y - 40, "color": color});
            blockPoints.push({"x": x - 40, "y": y + 40, "color": color});
            blockPoints.push({"x": x - 40, "y": y + 80, "color": color});
            block.leftX = x - 40;
            block.rightX = x;
            block.topY = y - 80;
            block.bottomY = y + 80;
        }
    } else if (type == 2) {
        block.color = classicColors[1];
        blockPoints.push({"x": x - 20, "y": y + 20, "color": color});
        if (rot == 0) {
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            blockPoints.push({"x": x - 60, "y": y - 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 60;
            block.topY = y - 60;
            block.bottomY = y + 20;
        } else if (rot == 1) {
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            block.leftX = x - 20;
            block.rightX = x + 60;
            block.topY = y - 60;
            block.bottomY = y + 60;
        } else if (rot == 2) {
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 60, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 60;
            block.topY = y - 20;
            block.bottomY = y + 60;
        } else if (rot == 3) {
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            blockPoints.push({"x": x - 60, "y": y + 60, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 20;
            block.topY = y - 60;
            block.bottomY = y + 60;  
        }
    } else if (type == 3) {
        block.color = classicColors[2];
        blockPoints.push({"x": x - 20, "y": y + 20, "color": color});
        if (rot == 0) {
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y - 20, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 60;
            block.topY = y - 60;
            block.bottomY = y + 20;
        } else if (rot == 1) {
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 60, "color": color});
            block.leftX = x - 20;
            block.rightX = x + 60;
            block.topY = y - 60;
            block.bottomY = y + 60;
        } else if (rot == 2) {
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            blockPoints.push({"x": x - 60, "y": y + 60, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 60;
            block.topY = y - 20;
            block.bottomY = y + 60;
        } else if (rot == 3) {
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x - 60, "y": y - 20, "color": color});
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 20;
            block.topY = y - 60;
            block.bottomY = y + 60;
        }
    } else if (type == 4) {
        block.color = classicColors[3];
        blockPoints.push({"x": x - 40, "y": y, "color": color});
        blockPoints.push({"x": x - 40, "y": y + 40, "color": color});
        blockPoints.push({"x": x, "y": y , "color": color});
        blockPoints.push({"x": x, "y": y + 40, "color": color});
        block.leftX = x - 40;
        block.rightX = x + 40;
        block.topY = y - 40;
        block.bottomY = y + 40;
    } else if (type == 5) {
        block.color = classicColors[4];
        blockPoints.push({"x": x - 20, "y": y + 20, "color": color});
        if (rot == 0) {
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y - 20, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 60;
            block.topY = y - 60;
            block.bottomY = y + 20;
        } else if (rot == 1) {
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 60, "color": color});
            block.leftX = x - 20;
            block.rightX = x + 60;
            block.topY = y - 60;
            block.bottomY = y + 60;
        } else if (rot == 2) {
            blockPoints.push({"x": x - 60, "y": y + 60, "color": color});
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 60;
            block.topY = y - 20;
            block.bottomY = y + 60;
        } else if (rot == 3) {
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            blockPoints.push({"x": x - 60, "y": y - 20, "color": color});
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 20;
            block.topY = y - 60;
            block.bottomY = y + 60;
        }
    } else if (type == 6) {
        block.color = classicColors[5];
        blockPoints.push({"x": x - 20, "y": y + 20, "color": color});
        if (rot == 0) {
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 60;
            block.topY = y - 60;
            block.bottomY = y + 20;
        } else if (rot == 1) {
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            block.leftX = x - 20;
            block.rightX = x + 60;
            block.topY = y - 60;
            block.bottomY = y + 60;
        } else if (rot == 2) {
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 60;
            block.topY = y - 20;
            block.bottomY = y + 60;
        } else if (rot == 3) {
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 20;
            block.topY = y - 60;
            block.bottomY = y + 60;
        }
    } else if (type == 7) {
        block.color = classicColors[6];
        blockPoints.push({"x": x - 20, "y": y + 20, "color": color});
        if (rot == 0) {
            blockPoints.push({"x": x - 60, "y": y - 20, "color": color});
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 60;
            block.topY = y - 60;
            block.bottomY = y + 20;   
        } else if (rot == 1) {
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y - 20, "color": color});
            block.leftX = x - 20;
            block.rightX = x + 60;
            block.topY = y - 60;
            block.bottomY = y + 60;
        } else if (rot == 2) {
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 60, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 60;
            block.topY = y - 20;
            block.bottomY = y + 6
        } else if (rot == 3) {
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            blockPoints.push({"x": x - 60, "y": y + 60, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 20;
            block.topY = y - 60;
            block.bottomY = y + 60;
        }
    } else if (type == 8) {
        block.color = newColors[0];
        blockPoints.push({"x": x - 20, "y": y + 20, "color": color});
        block.leftX = x - 20;
        block.rightX = x + 20;
        block.topY = y - 20;
        block.bottomY = y + 20;
    } else if (type == 9) {
        block.color = newColors[1];
        if (rot == 0) {
            blockPoints.push({"x": x - 40, "y": y, "color": color});
            blockPoints.push({"x": x, "y": y, "color": color});
            block.leftX = x - 40;
            block.rightX = x + 40;
            block.topY = y - 40;
            block.bottomY = y;
        } else if (rot == 1) {
            blockPoints.push({"x": x, "y": y, "color": color});
            blockPoints.push({"x": x, "y": y + 40, "color": color});
            block.leftX = x;
            block.rightX = x + 40;
            block.topY = y - 40;
            block.bottomY = y + 40;
        } else if (rot == 2) {
            blockPoints.push({"x": x - 40, "y": y + 40, "color": color});
            blockPoints.push({"x": x, "y": y + 40, "color": color});
            block.leftX = x - 40;
            block.rightX = x + 40;
            block.topY = y;
            block.bottomY = y + 40;
        } else if (rot == 3) {
            blockPoints.push({"x": x - 40, "y": y, "color": color});
            blockPoints.push({"x": x - 40, "y": y + 40, "color": color});
            block.leftX = x - 40;
            block.rightX = x;
            block.topY = y - 40;
            block.bottomY = y + 40;
        }
    } else if (type == 10) { 
        block.color = newColors[2];
        blockPoints.push({"x": x - 20, "y": y + 20, "color": color});
        if (rot == 1) {
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            block.leftX = x - 20;
            block.rightX = x + 60;
            block.topY = y - 60;
            block.bottomY = y + 20;
        } else if (rot == 0) {
            blockPoints.push({"x": x - 20, "y": y - 20, "color": color});
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 20;
            block.topY = y - 60;
            block.bottomY = y + 20;
        } else if (rot == 2) {
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            blockPoints.push({"x": x - 60, "y": y + 20, "color": color});
            block.leftX = x - 60;
            block.rightX = x + 20;
            block.topY = y - 20;
            block.bottomY = y + 60;
        } else if (rot == 3) {
            blockPoints.push({"x": x - 20, "y": y + 60, "color": color});
            blockPoints.push({"x": x + 20, "y": y + 20, "color": color});
            block.leftX = x - 20;
            block.rightX = x + 60;
            block.topY = y - 20;
            block.bottomY = y + 60;
        }
    }
}

function game() {

    function drawBoard(context) {
        if (mode == 2) {
            bgColor = modeColors[3];
            stripeColor = modeColors[2];
        } else {
            bgColor = modeColors[1];
            stripeColor = modeColors[2];
        }
        context.fillStyle = bgColor;
        context.strokeStyle = stripeColor;
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.lineWidth = 0.8;
        for (let i = 0; i < 10; i++) {
            context.moveTo(i * BLOCK_SIZE, 0);
            context.lineTo(i * BLOCK_SIZE, canvas.height);
            context.stroke();
        }
        for (let i = 0; i < 20; i++) {
            context.moveTo(0, i * BLOCK_SIZE);
            context.lineTo(canvas.width, i * BLOCK_SIZE);
            context.stroke();
        }
    }

    function drawBlock(context, x, y) {
        context.lineWidth = 0.5;
        if (mode == 0) {
            context.strokeStyle = modeColors[1];
        } else if (mode == 1) {
            context.strokeStyle = modeColors[2];
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
        for (let k = 0; k < heldPoints.length; k++) {
            let h = heldPoints[k];
            let canvas2 = /** @type {HTMLCanvasElement} */ (document.getElementById("myCanvas2"));
            let context2 = canvas2.getContext('2d');
            if (context2) {
                if (mode == 0) {
                    context2.fillStyle = h.color;
                } else if (mode == 1) {
                    context2.fillStyle = modeColors[0];
                } else if (mode == 2) {
                    context2.fillStyle = modeColors[1];
                }
            }
            drawBlock(context2, h.x, h.y);
        }
    }
    
    // Create a canvas element
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("myCanvas"));
    let context = canvas.getContext('2d');

    drawBoard(context);

    currPoints = [];
    createBlock(currBlock, currPoints, currBlock.type, currBlock.x, currBlock.y, currBlock.color, currBlock.rotation);
    chooseBlock(context);

    if (hold) {
        createBlock(heldBlock, heldPoints, heldBlock.type, 400, 550, heldBlock.color, heldBlock.rotation);
        chooseBlock(context);
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
        squares.forEach(function(s) {
            if (s.y == i * BLOCK_SIZE) {
                rowBlocks.push(s);
            }
            if (rowBlocks.length == 10) {
                let posY = rowBlocks[0].y;
                squares = squares.filter(s => !rowBlocks.includes(s));
                squares.forEach(function(s) {
                    if (s.y < posY) {
                        s.y += BLOCK_SIZE;
                    }
                })
                rowBlocks = [];
                score += ROW_BONUS;
                rowClear = true;
            }
        })
    }

    if (gameScreen) {
        window.requestAnimationFrame(game);
    }
}

function menus() {

    function startMenu(context) {

        startBoard();
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = '800 100px Courier New';
        context.fillStyle = 'white';
        context.fillText("Square", 130, 200);
        context.fillStyle = 'red';
        context.fillText("Saga", 220, 300);

        context.fillStyle = 'white';
        context.font = '550 20px Courier New';
        let text = "A blocky tale of light and darkness";
        context.fillText(text, 100, 400);
        context.textAlign = "center";

        // Create start button
        let startButton = document.createElement("startButton");
        startButton = createButton("Start", startButton, 650, 600, "red", "white");
        document.body.appendChild(startButton);
        startButton.onclick = function () {
            modeScreen = true;
            document.body.removeChild(startButton);
        }
    }

    function modeMenu(context) {
        
        startBoard();

        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.font = '550 15px Courier New';
        let lines = [
            "In an alternate universe, a fierce battle is raging",
            "between the forces of light and darkness.",
            "Amidst the chaos, a new hero emerges - you.",
            "",
            "Will you side with the forces of light, and fight for justice?",
            "Or will you succumb to darkness, and seek to conquer the world?",
            "Maybe you'll choose the path of neutrality,",
            "The fate of the universe hangs in the balance,",
            "awaiting your decision ..."
        ];
        let lineHeight = 50;
        let y = 100;
        for (let i = 0; i < lines.length; i++) {
            context.textAlign = "center";
            context.fillText(lines[i], canvas.width / 2, y);
            y += lineHeight;
        }

        let lightButton = document.createElement("lightButton");
        lightButton = createButton("Light", lightButton, 550, 600, "white", "black");
        document.body.appendChild(lightButton);
        
        let darkButton = document.createElement("darkButton");
        darkButton = createButton("Dark", darkButton, 750, 600, "dimgrey", "white");
        document.body.appendChild(darkButton);

        let classicButton = document.createElement("classicButton");
        classicButton = createButton("Classic", classicButton, 650, 680, "blue", "white");
        document.body.appendChild(classicButton);

        lightButton.onclick = function () {
            mode = 1;
            buttonClick();
        }

        darkButton.onclick = function () {
            mode = 2;
            buttonClick();
        }

        classicButton.onclick = function () {
            mode = 0;
            buttonClick();
        }

        function buttonClick() {
            aboutScreen = true;
            modeScreen = false;
            document.body.removeChild(lightButton);
            document.body.removeChild(darkButton);
            document.body.removeChild(classicButton);
        }
    }
    

    function gameplayMenu(context) {
        
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.fillStyle = 'white';

        if (mode == 0) {
            context.font = '600 40px Courier New';
            context.fillText("YOUR SCORE", 300, 100);
            context.font = '400 100px Courier New';
            context.fillText(score, 300, 250);
            context.textAlign = "center";
        } else if (mode == 1) {
            context.font = '600 40px Courier New';
            context.fillText("HEALTH", 130, 100);
            let health = 2000 - score;
            context.font = '400 80px Courier New';
            context.fillText(health, 130, 200);
            context.textAlign = "center";
            var image = new Image();
            image.src = "Images/Monster.png";
            context.drawImage(image, 250, 50, 300, 300);
        } else if (mode == 2) {
            context.font = '600 40px Courier New';
            context.fillText("AURA", 130, 100);
            let aura = 2000 - score;
            context.font = '400 80px Courier New';
            context.fillText(aura, 130, 200);
            context.textAlign = "center";
            var image = new Image();
            image.src = "Images/Tree.png";
            context.drawImage(image, 250, 50, 300, 300);
        }

        context.fillStyle = bgColor;
        context.fillRect(300, 400, 200, 200);
        context.lineWidth = 2;
        context.strokeStyle = 'white';
        context.strokeRect(300, 400, 200, 200);

        // Create hold button
        let holdButton = document.getElementById("holdButton");
        if (!holdButton) {
            let holdCheck = document.createElement("holdButton");
            holdCheck = createButton("Hold", holdCheck, 550, 500, "red", "white");
            holdCheck.id = "holdButton";
            document.body.appendChild(holdCheck);
        }
        let endButton = document.getElementById("endButton");
        if (!endButton) {
            let endCheck = document.createElement("endButton");    
            endCheck = createButton("End", endCheck, 650, 700, "red", "white");
            endCheck.id = "endButton";
            document.body.appendChild(endCheck);
        }
        if (holdButton) {
            holdButton.onclick = function () {
                if (hold) {
                    currBlock = heldBlock;
                    currPoints = heldPoints;
                    holdButton.textContent = "Hold";
                    heldBlock = [];
                    heldPoints = [];
                    hold = false;
                } else {
                    hold = true;
                    blocks.pop();
                    heldBlock = currBlock;
                    heldPoints = currPoints;
                    holdButton.textContent = "Unhold";
                    score += HOLD_COST;
                    pushBlock();
                }
            }
        }
        if (endButton) {
            endButton.onclick = function () {
                quit = true;
            }
        }

        if (score >= 2000 && mode != 0) {
            quit = true;
        }

        if (quit) {
            let holdButton = document.getElementById("holdButton");
            let endButton = document.getElementById("endButton");
            endScreen = true;
            gameScreen = false;
            if (holdButton) { document.body.removeChild(holdButton); }
            if (endButton) { document.body.removeChild(endButton); }
            hold = false;
            quit = false;
        }
    }

    function endMenu(context) {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (mode != 0) {
            if (score > 2000) {
                if (mode == 1) {
                    context.fillStyle = 'white';
                    context.font = '540 25px Courier New';
                    let text = "By choosing the path of light, you have saved the universe.";
                    context.fillText(text, 300, 400);
                    text = "The demon Vortax has been vanquished.";
                    context.fillText(text, 300, 450);
                    text = "The world is safe once more.";
                    context.fillText(text, 300, 500);
                    context.textAlign = "center";
                } else if (mode == 2) {
                    context.fillStyle = 'red';
                    context.font = '540 25px Courier New';
                    let text = "By choosing the path of darkness, you have conquered the universe.";
                    context.fillText(text, 300, 400);
                    text = "The aura-giving tree has been destroyed.";
                    context.fillText(text, 300, 450);
                    text = "The world is yours to command.";
                    context.fillText(text, 300, 500);
                    context.textAlign = "center";
                }
                context.font = '600 50px Courier New';
                context.fillText("You won!", 300, 250);
                context.textAlign = "center";
            } else {
                if (mode == 1) {
                    context.fillStyle = 'white';
                    context.font = '540 22px Courier New';
                    let text = "You had chosen the path of light,";
                    context.fillText(text, 300, 400);
                    text = "but the demon Vortax proved too strong.";
                    context.fillText(text, 300, 450);
                    text = "The light has been vanquished.";
                    context.fillText(text, 300, 500);
                    context.textAlign = "center";
                } else if (mode == 2) {
                    context.fillStyle = 'red';
                    context.font = '540 20px Courier New';
                    let text = "You had chosen the path of darkness,";
                    context.fillText(text, 300, 400);
                    text = "but the aura-giving tree proved too resilient.";
                    context.fillText(text, 300, 450);
                    text = "The darkness has been vanquished.";
                    context.fillText(text, 300, 500);
                    context.textAlign = "center";
                }
                context.font = '600 50px Courier New';
                context.fillText("You lost ...", 300, 250);
                context.textAlign = "center";
            }
        } else {
            context.fillStyle = 'white';

            context.font = '600 100px Courier New';
            context.fillText("GAME OVER", 300, 250);
            context.textAlign = "center";

            context.font = '400 30px Courier New';
            context.fillText("Would you like to play again?", 300, 350);
            context.textAlign = "center";
        }

            let playButton = document.createElement("playButton");
            playButton = createButton("Retry", playButton, 650, 600, "red", "white");
            document.body.appendChild(playButton);
            playButton.onclick = function () {
                score = 0;
                heldBlock = [];
                heldPoints = [];
                modeScreen = true;
                document.body.removeChild(playButton);
                blocks = [];
                squares = [];
                currPoints = [];
            }
        context.font = '600 25px Courier New';
        context.fillText("Your score: " + score, 300, 700);
        context.textAlign = "center";
    }

    function aboutMenu(context) {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'white';
        context.font = '600 40px Courier New';
        if (mode == 0) {
            context.fillText("Classic Mode", 300, 100);
            context.font = '400 15px Courier New';
            let text = "In Classic Mode, you must clear rows of blocks to score points.";
            context.fillText(text, 300, 150);
            text = "The more rows you clear, the higher your score.";
            context.fillText(text, 300, 200);
            text = "The game ends when the blocks reach the top.";
            context.fillText(text, 300, 250);
            text = "Hold a block by clicking the Hold button.";
            context.fillText(text, 300, 300);
            text = "Holding a block will cost you some points.";
            context.fillText(text, 300, 350);
            text = "The game ends when the blocks reach the top.";
            context.fillText(text, 300, 400);
            text = "Good luck!";
            context.fillText(text, 300, 550);
            context.textAlign = "center";
        } else if (mode == 1) {
            context.fillText("Light Mode", 300, 100);
            context.font = '400 15px Courier New';
            let text = "In Light Mode, you must protect the universe from the darkness.";
            context.fillText(text, 300, 150);
            text = "The demon Vortax has invaded the universe.";
            context.fillText(text, 300, 200);
            text = "Defeat him by clearing rows of blocks.";
            context.fillText(text, 300, 250);
            text = "The more rows you clear, the more health he loses.";
            context.fillText(text, 300, 300);
            text = "The game ends when Vortax's health reaches 0.";
            context.fillText(text, 300, 350);
            text = "Hold a block by clicking the Hold button.";
            context.fillText(text, 300, 400);
            text = "Holding a block will increase Vortax's health by a small amount.";
            context.fillText(text, 300, 450);
            text = "Good luck!";
            context.fillText(text, 300, 550);
            text = "The fate of the universe is in your hands.";
            context.fillText(text, 300, 600);
            context.textAlign = "center";
        } else if (mode == 2) {
            context.fillText("Dark Mode", 300, 100);
            context.font = '400 15px Courier New';
            let text = "In Dark Mode, you must conquer the universe with darkness.";
            context.fillText(text, 300, 150);
            text = "The aura-giving tree is the last bastion of light.";
            context.fillText(text, 300, 200);
            text = "Destroy it by clearing rows of blocks.";
            context.fillText(text, 300, 250);
            text = "The more rows you clear, the more aura the tree loses.";
            context.fillText(text, 300, 300);
            text = "The game ends when the tree's aura reaches 0.";
            context.fillText(text, 300, 350);
            text = "Hold a block by clicking the Hold button.";
            context.fillText(text, 300, 400);
            text = "Holding a block will increase the tree's aura by a small amount.";
            context.fillText(text, 300, 450);
            text = "Good luck!";
            context.fillText(text, 300, 550);
            text = "You are the harbinger of darkness.";
            context.fillText(text, 300, 600);
            context.textAlign = "center";
        }
        let continueButton = document.createElement("continueButton");
        continueButton = createButton("Continue", continueButton, 650, 700, "red", "white");
        document.body.appendChild(continueButton);
        continueButton.onclick = function () {
            gameScreen = true;
            aboutScreen = false;
            document.body.removeChild(continueButton);
            pushBlock();
            game();
        }
    }

    function createButton(text, button, left, top, bgColor, textColor) {
        button.style.width = "100px";
        button.style.height = "30px";
        button.innerHTML = text;
        button.style.fontSize = "25px";
        button.style.padding = "2px";
        button.style.textAlign = "center";
        button.style.borderRadius = "10px";
        button.style.backgroundColor = bgColor;
        button.style.color = textColor;
        button.style.position = "absolute";
        button.style.left = left + "px";
        button.style.top = top + "px";
        return button;
    }

    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("myCanvas2"));
    let context = canvas.getContext('2d');

    if (startScreen) {
        startScreen = false;
        startMenu(context);
    } else if (modeScreen) {
        modeScreen = false;
        modeMenu(context);
    } else if (aboutScreen) {
        aboutScreen = false;
        aboutMenu(context);
    } else if (gameScreen) {
        gameplayMenu(context);
    } else if (endScreen) {
        endScreen = false;
        endMenu(context);
    }
    window.requestAnimationFrame(menus);
}

menus();
