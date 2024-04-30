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
let quitButton = false;
let rowClear = false;

let colors = ['cyan', 'purple', 'orange', 'yellow', 'green', 'blue', 'red'];
let modeColors = ['white', 'black', 'grey', 'dimgray'];
let tetros = [];
let currTetro = [];
let allSquares = [];
let prev, curr;
let score = 0;
let time = 0;
let mode = 0;
let won = false;

window.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        if (curr.leftX > 0 ) {
            curr.x -= BLOCK_SIZE;
        }
    } else if (event.key === 'ArrowRight') {
        if (curr.rightX < BOARD_WIDTH) {
            curr.x += BLOCK_SIZE;
        }
    } else if (event.key === 'ArrowUp') {
        if (curr.rotation < 3) {
            curr.rotation += 1;
        } else {
            curr.rotation = 0;
        }
    }
});

function designBoard() {
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("myCanvas"));
    let context = canvas.getContext('2d');
    if (context) {

        // background
        context.fillStyle = modeColors[0];
        context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT * 7/20);
        context.fillStyle = colors[Math.floor(Math.random() * 7)];
        context.fillRect(0, BOARD_HEIGHT * 7/20, BOARD_WIDTH, BOARD_HEIGHT * 6/20);    
        context.fillStyle = modeColors[3];
        context.fillRect(0, BOARD_HEIGHT * 13/20, BOARD_WIDTH, BOARD_HEIGHT * 7/20);

        context.strokeStyle = modeColors[1];
        // strokes
        for (let i = 0; i < 10; i++) {
            context.beginPath();
            context.moveTo(i * BLOCK_SIZE, 0);
            context.lineTo(i * BLOCK_SIZE, BOARD_HEIGHT * 7/20);
            context.stroke();
            context.closePath();

            context.beginPath();
            context.moveTo(i * BLOCK_SIZE, BOARD_HEIGHT * 13/20);
            context.lineTo(i * BLOCK_SIZE, BOARD_HEIGHT);
            context.stroke();
            context.closePath();

            context.beginPath();
            context.moveTo(i * BLOCK_SIZE, BOARD_HEIGHT * 7/20);
            context.lineTo(i * BLOCK_SIZE, BOARD_HEIGHT * 13/20);
            context.stroke();
            context.closePath();
        }

        for (let j = 0; j < 7; j++) {
            context.beginPath();
            context.moveTo(0, j * BLOCK_SIZE);
            context.lineTo(BOARD_WIDTH, j * BLOCK_SIZE);
            context.stroke();
            context.closePath();

            context.beginPath();
            context.moveTo(0, BOARD_HEIGHT * 13/20 + j * BLOCK_SIZE);
            context.lineTo(BOARD_WIDTH, BOARD_HEIGHT * 13/20 + j * BLOCK_SIZE);
            context.stroke();
            context.closePath();
        }
        for (let k = 0; k < 6; k++) {
            context.beginPath();
            context.moveTo(0, BOARD_HEIGHT * 7/20 + k * BLOCK_SIZE);
            context.lineTo(BOARD_WIDTH, BOARD_HEIGHT * 7/20 + k * BLOCK_SIZE);
            context.stroke();
            context.closePath();
        }
    }
}

function make() {
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
    tetros.push({"type": type, "rotation": rot, "color": color, "x": x, "y": y, "leftX": leftX, "rightX": rightX, "topY": topY, "bottomY": bottomY, "down": false});
    curr = tetros[tetros.length - 1];
}

function detectCollision(x, y) {
    for (let i = 0; i < allSquares.length; i++) {
        let s = allSquares[i];
        if ((s.x == x) && (s.y == y + BLOCK_SIZE)) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

function game() {

    function board(context) {
        context.strokeStyle = modeColors[2];
        if (mode == 2) {
            context.fillStyle = modeColors[3];
        } else {
            context.fillStyle = modeColors[1];
        }
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

    function block(context, x, y) {
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

    function pieces(type, x, y, color, rot) {
        if (type == 1) {
            curr.color = colors[0];
            if (rot == 0) {
                currTetro.push({"x": x - 80, "y": y, "color": color});
                currTetro.push({"x": x - 40, "y": y, "color": color});
                currTetro.push({"x": x, "y": y , "color": color});
                currTetro.push({"x": x + 40, "y": y, "color": color});
                curr.leftX = x - 80;
                curr.rightX = x + 80;
                curr.topY = y - 40;
                curr.bottomY = y;
            } else if (rot == 1) {
                currTetro.push({"x": x, "y": y, "color": color});
                currTetro.push({"x": x, "y": y - 40, "color": color});
                currTetro.push({"x": x, "y": y + 40, "color": color});
                currTetro.push({"x": x, "y": y + 80, "color": color});
                curr.leftX = x;
                curr.rightX = x + 40;
                curr.topY = y - 80;
                curr.bottomY = y + 80;
            } else if (rot == 2) {
                currTetro.push({"x": x - 80, "y": y + 40, "color": color});
                currTetro.push({"x": x - 40, "y": y + 40, "color": color});
                currTetro.push({"x": x, "y": y + 40, "color": color});
                currTetro.push({"x": x + 40, "y": y + 40, "color": color});
                curr.leftX = x - 80;
                curr.rightX = x + 80;
                curr.topY = y;
                curr.bottomY = y + 40;
            }  else if (rot == 3) {
                currTetro.push({"x": x - 40, "y": y, "color": color});
                currTetro.push({"x": x - 40, "y": y - 40, "color": color});
                currTetro.push({"x": x - 40, "y": y + 40, "color": color});
                currTetro.push({"x": x - 40, "y": y + 80, "color": color});
                curr.leftX = x - 40;
                curr.rightX = x;
                curr.topY = y - 80;
                curr.bottomY = y + 80;
            }
        } else if (type == 2) {
            curr.color = colors[1];
            currTetro.push({"x": x - 20, "y": y + 20, "color": color});
            if (rot == 0) {
                currTetro.push({"x": x - 60, "y": y + 20, "color": color});
                currTetro.push({"x": x - 60, "y": y - 20, "color": color});
                currTetro.push({"x": x + 20, "y": y + 20, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 60;
                curr.topY = y - 60;
                curr.bottomY = y + 20;
            } else if (rot == 1) {
                currTetro.push({"x": x - 20, "y": y - 20, "color": color});
                currTetro.push({"x": x + 20, "y": y - 20, "color": color});
                currTetro.push({"x": x - 20, "y": y + 60, "color": color});
                curr.leftX = x - 20;
                curr.rightX = x + 60;
                curr.topY = y - 60;
                curr.bottomY = y + 60;
            } else if (rot == 2) {
                currTetro.push({"x": x - 60, "y": y + 20, "color": color});
                currTetro.push({"x": x + 20, "y": y + 20, "color": color});
                currTetro.push({"x": x + 20, "y": y + 60, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 60;
                curr.topY = y - 20;
                curr.bottomY = y + 60;
            } else if (rot == 3) {
                currTetro.push({"x": x - 20, "y": y - 20, "color": color});
                currTetro.push({"x": x - 20, "y": y + 60, "color": color});
                currTetro.push({"x": x - 60, "y": y + 60, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 20;
                curr.topY = y - 60;
                curr.bottomY = y + 60;  
            }
        } else if (type == 3) {
            curr.color = colors[2];
            currTetro.push({"x": x - 20, "y": y + 20, "color": color});
            if (rot == 0) {
                currTetro.push({"x": x - 60, "y": y + 20, "color": color});
                currTetro.push({"x": x + 20, "y": y + 20, "color": color});
                currTetro.push({"x": x + 20, "y": y - 20, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 60;
                curr.topY = y - 60;
                curr.bottomY = y + 20;

            } else if (rot == 1) {
                currTetro.push({"x": x - 20, "y": y - 20, "color": color});
                currTetro.push({"x": x - 20, "y": y + 60, "color": color});
                currTetro.push({"x": x + 20, "y": y + 60, "color": color});
                curr.leftX = x - 20;
                curr.rightX = x + 60;
                curr.topY = y - 60;
                curr.bottomY = y + 60;
            } else if (rot == 2) {
                currTetro.push({"x": x - 60, "y": y + 20, "color": color});
                currTetro.push({"x": x - 60, "y": y + 60, "color": color});
                currTetro.push({"x": x + 20, "y": y + 20, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 60;
                curr.topY = y - 20;
                curr.bottomY = y + 60;
            } else if (rot == 3) {
                currTetro.push({"x": x - 20, "y": y - 20, "color": color});
                currTetro.push({"x": x - 60, "y": y - 20, "color": color});
                currTetro.push({"x": x - 20, "y": y + 60, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 20;
                curr.topY = y - 60;
                curr.bottomY = y + 60;
            }
        } else if (type == 4) {
            curr.color = colors[3];
            currTetro.push({"x": x - 40, "y": y, "color": color});
            currTetro.push({"x": x - 40, "y": y + 40, "color": color});
            currTetro.push({"x": x, "y": y , "color": color});
            currTetro.push({"x": x, "y": y + 40, "color": color});
            curr.leftX = x - 40;
            curr.rightX = x + 40;
            curr.topY = y - 40;
            curr.bottomY = y + 40;
        } else if (type == 5) {
            curr.color = colors[4];
            currTetro.push({"x": x - 20, "y": y + 20, "color": color});
            if (rot == 0) {
                currTetro.push({"x": x - 60, "y": y + 20, "color": color});
                currTetro.push({"x": x - 20, "y": y - 20, "color": color});
                currTetro.push({"x": x + 20, "y": y - 20, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 60;
                curr.topY = y - 60;
                curr.bottomY = y + 20;
            } else if (rot == 1) {
                currTetro.push({"x": x - 20, "y": y - 20, "color": color});
                currTetro.push({"x": x + 20, "y": y + 20, "color": color});
                currTetro.push({"x": x + 20, "y": y + 60, "color": color});
                curr.leftX = x - 20;
                curr.rightX = x + 60;
                curr.topY = y - 60;
                curr.bottomY = y + 60;
            } else if (rot == 2) {
                currTetro.push({"x": x - 60, "y": y + 60, "color": color});
                currTetro.push({"x": x - 20, "y": y + 60, "color": color});
                currTetro.push({"x": x + 20, "y": y + 20, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 60;
                curr.topY = y - 20;
                curr.bottomY = y + 60;
            } else if (rot == 3) {
                currTetro.push({"x": x - 60, "y": y + 20, "color": color});
                currTetro.push({"x": x - 60, "y": y - 20, "color": color});
                currTetro.push({"x": x - 20, "y": y + 60, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 20;
                curr.topY = y - 60;
                curr.bottomY = y + 60;
            }
        } else if (type == 6) {
            curr.color = colors[5];
            currTetro.push({"x": x - 20, "y": y + 20, "color": color});
            if (rot == 0) {
                currTetro.push({"x": x - 60, "y": y + 20, "color": color});
                currTetro.push({"x": x + 20, "y": y + 20, "color": color});
                currTetro.push({"x": x - 20, "y": y - 20, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 60;
                curr.topY = y - 60;
                curr.bottomY = y + 20;
            } else if (rot == 1) {
                currTetro.push({"x": x - 20, "y": y - 20, "color": color});
                currTetro.push({"x": x + 20, "y": y + 20, "color": color});
                currTetro.push({"x": x - 20, "y": y + 60, "color": color});
                curr.leftX = x - 20;
                curr.rightX = x + 60;
                curr.topY = y - 60;
                curr.bottomY = y + 60;
            } else if (rot == 2) {
                currTetro.push({"x": x - 60, "y": y + 20, "color": color});
                currTetro.push({"x": x + 20, "y": y + 20, "color": color});
                currTetro.push({"x": x - 20, "y": y + 60, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 60;
                curr.topY = y - 20;
                curr.bottomY = y + 60;
            } else if (rot == 3) {
                currTetro.push({"x": x - 20, "y": y - 20, "color": color});
                currTetro.push({"x": x - 20, "y": y + 60, "color": color});
                currTetro.push({"x": x - 60, "y": y + 20, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 20;
                curr.topY = y - 60;
                curr.bottomY = y + 60;
            }
        } else if (type == 7) {
            curr.color = colors[6];
            currTetro.push({"x": x - 20, "y": y + 20, "color": color});
            if (rot == 0) {
                currTetro.push({"x": x - 60, "y": y - 20, "color": color});
                currTetro.push({"x": x - 20, "y": y - 20, "color": color});
                currTetro.push({"x": x + 20, "y": y + 20, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 60;
                curr.topY = y - 60;
                curr.bottomY = y + 20;   
            } else if (rot == 1) {
                currTetro.push({"x": x - 20, "y": y + 60, "color": color});
                currTetro.push({"x": x + 20, "y": y + 20, "color": color});
                currTetro.push({"x": x + 20, "y": y - 20, "color": color});
                curr.leftX = x - 20;
                curr.rightX = x + 60;
                curr.topY = y - 60;
                curr.bottomY = y + 60;
            } else if (rot == 2) {
                currTetro.push({"x": x - 60, "y": y + 20, "color": color});
                currTetro.push({"x": x - 20, "y": y + 60, "color": color});
                currTetro.push({"x": x + 20, "y": y + 60, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 60;
                curr.topY = y - 20;
                curr.bottomY = y + 60;
            } else if (rot == 3) {
                currTetro.push({"x": x - 20, "y": y - 20, "color": color});
                currTetro.push({"x": x - 60, "y": y + 20, "color": color});
                currTetro.push({"x": x - 60, "y": y + 60, "color": color});
                curr.leftX = x - 60;
                curr.rightX = x + 20;
                curr.topY = y - 60;
                curr.bottomY = y + 60;
            }
        }
    }

    function draw(context) {
        for (let i = 0; i < allSquares.length; i++) {
            let s = allSquares[i];
            context.fillStyle = s.color;
            block(context, s.x, s.y);
        }
        for (let j = 0; j < currTetro.length; j++) {
            let c = currTetro[j];
            context.fillStyle = c.color;
            block(context, c.x, c.y);
        }
    }
    
    // Create a canvas element
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("myCanvas"));
    let context = canvas.getContext('2d');

    board(context);

    for (let i = 0; i < currTetro.length; i++) {
        let c = currTetro[i];
        let x = c.x;
        let y = c.y; 
        if (detectCollision(x, y)) { 
            curr.down = true;
            break;
        }
    }

    if (curr.bottomY >= BOARD_HEIGHT) {
        curr.down = true;
    }

    if (curr.down) {
        if (curr.topY <= 0) {
            endScreen = true;
            gameScreen = false;
        }
        score += BLOCK_BONUS;
        prev = curr;
        for (let i = 0; i < currTetro.length; i++) {
            allSquares.push(currTetro[i]);
        }
        currTetro = [];
        make();
    } else {
        currTetro = [];
        curr.y += BLOCK_SPEED;
    }

    for (let i = 1; i < 21; i++) {
        let rowBlocks = [];
        allSquares.forEach(function(s) {
            if (s.y == i * BLOCK_SIZE) {
                rowBlocks.push(s);
            }
            if (rowBlocks.length == 10) {
                let posY = rowBlocks[0].y;
                allSquares = allSquares.filter(s => !rowBlocks.includes(s));
                allSquares.forEach(function(s) {
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

    pieces(curr.type, curr.x, curr.y, curr.color, curr.rotation);
    draw(context);

    if (gameScreen) {
        window.requestAnimationFrame(game);
    }
}

function menus() {

    function startMenu(context) {

        designBoard();
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
        startButton = createButton("Start", startButton);
        startButton.onclick = function () {
            modeScreen = true;
            //gameScreen = true;
            document.body.removeChild(startButton);
            //make();
            //game();
        }
        document.body.appendChild(startButton);
    }

    function modeMenu(context) {
        
        designBoard();

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
        lightButton.style.width = "150px";
        lightButton.style.height = "30px";
        lightButton.innerHTML = "Light";
        lightButton.style.fontSize = "25px";
        lightButton.style.padding = "2px";
        lightButton.style.textAlign = "center";
        lightButton.style.borderRadius = "10px";
        lightButton.style.backgroundColor = "white";
        lightButton.style.color = "black";
        lightButton.style.position = "absolute";
        lightButton.style.left = "530px";
        lightButton.style.top = "600px";
        document.body.appendChild(lightButton);
        
        let darkButton = document.createElement("darkButton");
        darkButton.style.width = "150px";
        darkButton.style.height = "30px";
        darkButton.innerHTML = "Dark";
        darkButton.style.fontSize = "25px";
        darkButton.style.padding = "2px";
        darkButton.style.textAlign = "center";
        darkButton.style.borderRadius = "10px";
        darkButton.style.backgroundColor = "grey";
        darkButton.style.color = "black";
        darkButton.style.position = "absolute";
        darkButton.style.left = "760px";
        darkButton.style.top = "600px";
        document.body.appendChild(darkButton);

        let classicButton = document.createElement("classicButton");
        classicButton.style.width = "150px";
        classicButton.style.height = "30px";
        classicButton.innerHTML = "Classic";
        classicButton.style.fontSize = "25px";
        classicButton.style.padding = "2px";
        classicButton.style.textAlign = "center";
        classicButton.style.borderRadius = "10px";
        classicButton.style.backgroundColor = "blue";
        classicButton.style.color = "white";
        classicButton.style.position = "absolute";
        classicButton.style.left = "660px";
        classicButton.style.top = "680px";
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
            make();
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

        if (gameScreen && !quitButton) {
            quitButton = true;
            let endButton = document.createElement("endButton");    
            endButton = createButton("End", endButton);
            endButton.id = "endButton";
            document.body.appendChild(endButton);

            endButton.onclick = function () {
                endScreen = true;
                gameScreen = false;
                document.body.removeChild(endButton);
            };
        } else if (!gameScreen && quitButton) {
            quitButton = false;
            gameScreen = false;
            let endButton = document.getElementById("endButton");
            if (endButton) {
                document.body.removeChild(endButton);
            }
        }
        // let endButton = document.getElementById("endButton");
        // if (endButton) {
        //         endButton.onclick = function () {
        //             endScreen = true;
        //             gameScreen = false;
        //             document.body.removeChild(endButton);
        //         }
        // }
    }

    function endMenu(context) {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (score > 0) {
            if (mode == 1) {
                context.fillStyle = 'white';
                context.font = '540 25px Courier New';
                context.fillText("You have chosen the path of light", 300, 400);
                context.fillText("and have saved the universe.", 300, 450);
            }
            if (mode == 2) {
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

        context.font = '600 25px Courier New';
        context.fillText("Your score: " + score, 300, 600);
        context.textAlign = "center";
    }

    function createButton(text, button) {
        button.style.width = "100px";
        button.style.height = "30px";
        button.innerHTML = text;
        button.style.font = "Arial";
        button.style.fontSize = "25px";
        button.style.padding = "2px";
        button.style.textAlign = "center";
        button.style.borderRadius = "10px";
        button.style.backgroundColor = "red";
        button.style.color = "white";
        button.style.position = "absolute";
        button.style.left = "670px";
        button.style.top = "600px";
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
        endScreen = false;
        endMenu(context);
    }
    window.requestAnimationFrame(menus);
}

menus();