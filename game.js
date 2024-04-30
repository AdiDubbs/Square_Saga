// @ts-check

const BLOCK_SIZE = 40;
const BLOCK_SPEED = 4;
const ROW_BONUS = 100;
const BLOCK_BONUS = 20;
const BOARD_WIDTH = 400;
const BOARD_HEIGHT = 800;

let startScreen = true;
let gameScreen = false;
let endScreen = false;
let quitButton = false;
let rowClear = false;

let colors = ['cyan', 'purple', 'orange', 'yellow', 'green', 'blue', 'red'];
let tetros = [];
let currTetro = [];
let allSquares = [];
let prev, curr;
let score = 0;
let time = 0;

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


export function make() {
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

export function game() {

    function block(context, x, y) {
        context.strokeStyle = "black";
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

    function board(context) {
        context.strokeStyle = 'grey';
        context.fillStyle = 'black';
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

        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.font = '800 90px Courier New';
        context.fillText("Shape", 40, 200);
        context.fillText("Shift", 80, 300);

        // Create start button
        let startButton = document.createElement("startButton");
        startButton = createButton("Start", startButton);
        startButton.onclick = function () {
            gameScreen = true;
            document.body.removeChild(startButton);
            make();
            game();
        }
        document.body.appendChild(startButton);
    }

    function gameplayMenu(context) {
        
            context.fillStyle = 'black';
            context.fillRect(0, 0, canvas.width, canvas.height)
            
            context.fillStyle = 'white';
            context.font = '600 40px Courier New';
            context.fillText("SCORE", 190, 100);
            context.textAlign = "center";

            // Create score display
            context.fillStyle = 'white';
            context.font = '400 100px Courier New';
            context.fillText(score, 190, 200);
            context.textAlign = "center";

            if (rowClear && time < 50) {
                context.fillStyle = 'white';
                context.font = '550 30px Courier New';
                context.fillText("Row Cleared!", 200, 350);
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
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.fillStyle = 'white';
        context.font = '600 100px Courier New';
        context.fillText("GAME", 200, 200);
        context.fillText("OVER", 200, 300);

        context.font = '400 30px Courier New';
        context.fillText("Your score: " + score, 200, 600);
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
        button.style.left = "560px";
        button.style.top = "600px";
        return button;
    }

    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("myCanvas2"));
    let context = canvas.getContext('2d');

    if (startScreen) {
        startScreen = false;
        startMenu(context);
    } else if (gameScreen) {
        gameplayMenu(context);
    } else if (endScreen) {
        endScreen = false;
        endMenu(context);
    }
    window.requestAnimationFrame(menus);
}

menus();