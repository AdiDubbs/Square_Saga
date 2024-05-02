// @ts-check

const BLOCK_SIZE = 40;
const BLOCK_SPEED = 4;
const ROW_BONUS = 100;
const BLOCK_BONUS = 20;
const BOARD_WIDTH = 400;
const BOARD_HEIGHT = 800;

let startScreen = true;
let modeScreen = false;
let gameScreen = false;
let endScreen = false;
let quit = false;
let hold = false;
let rowClear = false;

let classicColors = ['aqua', 'mediumblue', 'orange', 'yellow', 'limegreen', 'mediumpurple', 'red'];
let modeColors = ['white', 'black', 'grey', 'dimgray'];
let blocks = [];
let squares = [];
let currPoints = [];
let heldPoints = [];
let oldHeld = [];
let currBlock, heldBlock;
let bgColor, stripeColor;
let score = 0;
let time = 0;
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
    let type = Math.floor(Math.random() * 6) + 1;
    let color = 0;
    let x = 0;
    let y = 0;
    let rightX = 0;
    let leftX = 0;
    let topY = 0;
    let bottomY = 0;
    let rot = 0;
    if ((type == 1) || (type == 4)) {
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

function createBlock(block, points, type, x, y, color, rot) {
    let blockPoints = points;
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
            context.fillStyle = h.color;
            drawBlock(context, h.x, h.y);
        }
    }
    
    // Create a canvas element
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("myCanvas"));
    let context = canvas.getContext('2d');

    drawBoard(context);

    for (let i = 0; i < currPoints.length; i++) {
        let c = currPoints[i];
        let x = c.x;
        let y = c.y; 
        if (detectCollision(x, y)) { 
            currBlock.down = true;
            break;
        }
    }

    if (currBlock.bottomY >= BOARD_HEIGHT) {
        currBlock.down = true;
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

    createBlock(currBlock, currPoints, currBlock.type, currBlock.x, currBlock.y, currBlock.color, currBlock.rotation);
    chooseBlock(context);

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
            gameScreen = true;
            modeScreen = false;
            document.body.removeChild(lightButton);
            document.body.removeChild(darkButton);
            document.body.removeChild(classicButton);
            pushBlock();
            game();
        }
    }
    

    function gameplayMenu(context) {
        
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height)
        
        context.fillStyle = 'white';
        context.font = '600 40px Courier New';
        context.fillText("SCORE", 300, 100);
        context.textAlign = "center";

        // Create score display
        context.fillStyle = 'white';
        context.font = '400 100px Courier New';
        context.fillText(score, 300, 200);
        context.textAlign = "center";

        if (rowClear && time < 50) {
            context.fillStyle = 'white';
            context.font = '550 30px Courier New';
            context.fillText("Row Cleared!", 300, 350);
            context.textAlign = "center";
            time++;
        }
        if (time == 50) {
            rowClear = false;
            time = 0;
        }

        context.fillStyle = bgColor;
        context.fillRect(200, 300, 200, 200);
        context.lineWidth = 2;
        context.stroke();
        context.strokeStyle = stripeColor;
        context.lineWidth = 0.8;

        for (let i = 0; i < 6; i++) {
            context.moveTo(200, 300 + i * BLOCK_SIZE);
            context.lineTo(400, 300 + i * BLOCK_SIZE);
            context.stroke();
        }
        for (let i = 0; i < 6; i++) {
            context.moveTo(200 + i * BLOCK_SIZE, 300);
            context.lineTo(200 + i * BLOCK_SIZE, 500);
            context.stroke();
        }

        if (hold) {
            createBlock(heldBlock, heldPoints, heldBlock.type, 200, 300, heldBlock.color, heldBlock.rotation);
            oldHeld.push(heldBlock.x);
            oldHeld.push(heldBlock.y);
        }

        // Create hold button
        let holdButton = document.getElementById("holdButton");
        if (!holdButton) {
            let holdCheck = document.createElement("holdButton");
            holdCheck = createButton("Hold", holdCheck, 650, 600, "red", "white");
            holdCheck.id = "holdButton";
            document.body.appendChild(holdCheck);
        }
        let endButton = document.getElementById("endButton");
        if (!endButton) {
            let endCheck = document.createElement("endButton");    
            endCheck = createButton("End", endCheck, 650, 680, "red", "white");
            endCheck.id = "endButton";
            document.body.appendChild(endCheck);
        }
        if (holdButton) {
            holdButton.onclick = function () {
                hold = true;
                heldBlock = currBlock;
                blocks.pop();
                pushBlock();
            }
        }
        if (endButton) {
            endButton.onclick = function () {
                quit = true;
            }
        }

        if (quit) {
            console.log("quit")
            let hold = document.getElementById("holdButton");
            let end = document.getElementById("endButton");
            endScreen = true;
            gameScreen = false;
            if (hold) { document.body.removeChild(hold); }
            if (end) { document.body.removeChild(end); }
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
                    context.fillText("You have chosen the path of light", 300, 400);
                    context.fillText("and have saved the universe.", 300, 450);
                } else if (mode == 2) {
                    context.fillStyle = 'red';
                    context.font = '540 25px Courier New';
                    context.fillText("You have chosen the path of darkness", 300, 400);
                    context.fillText("and have conquered the universe.", 300, 450);
                }
                context.font = '600 50px Courier New';
                context.fillText("You Won!", 300, 250);
                context.textAlign = "center";
            } else {
                if (mode == 1) {
                    context.fillStyle = 'white';
                    context.font = '540 25px Courier New';
                    context.fillText("You had chosen the path of light", 300, 400);
                    context.fillText("but the darkness has won.", 300, 450);
                    context.fillText("The world has been destroyed.", 300, 500);
                } else if (mode == 2) {
                    context.fillStyle = 'red';
                    context.font = '540 25px Courier New';
                    context.fillText("You had chosen the path of darkness", 300, 400);
                    context.fillText("but the light proved too strong.", 300, 450);
                    context.fillText("The darkness has been vanquished.", 300, 500);
                }
                context.font = '600 50px Courier New';
                context.fillText("You Lost ...", 300, 250);
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

        

        context.fillStyle = 'white';
        context.font = '600 25px Courier New';
        context.fillText("Your score: " + score, 300, 650);
        context.textAlign = "center";
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
    } else if (gameScreen) {
        gameplayMenu(context);
    } else if (endScreen) {
        endMenu(context);
    }
    window.requestAnimationFrame(menus);
}

menus();