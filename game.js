// @ts-check

let colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan'];
let tetros = [];
let fallenTetros = [];
let currBlock = [];
let allSquares = [];
let prev, curr;
let count = 0;

window.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        if (curr.x > 0 ) {
            curr.x -= 40;
            curr.rightX -= 40;
        }
    } else if (event.key === 'ArrowRight') {
        if (curr.rightX < 400) {
            curr.x += 40;
            curr.rightX += 40;
        }
    }
});


function make() {
    let num = Math.floor(Math.random() * 6) + 1;
    let color = colors[Math.floor(Math.random() * colors.length)];
    let x = Math.floor(Math.random() * 7) * 40;
    let y = 0;
    let rightX = 0;
    if (num == 1) {
        rightX = x + 80;
    } else if (num == 2) {
        rightX = x + 40;
    } else if (num == 3) {
        rightX = x + 120;
    } else if (num == 4) {
        rightX = x + 120;
    } else if (num == 5) {
        rightX = x + 80;
    } else if (num == 6) {
        rightX = x + 80;
    } else if (num == 7) {
        rightX = x + 120;
    }
    tetros.push({"type": num, "color": color, "x": x, "y": y, "rightX": rightX, "down": false});
    curr = tetros[tetros.length - 1];
}

function detectCollision(x, y) {
    for (let i = 0; i < allSquares.length; i++) {
        let s = allSquares[i];
        if ((s.x == x) && (s.y == y + 40)) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

function game() {
    function block(context) {
        //console.log("context")
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(40, 0);
        context.lineTo(40, -40);
        context.lineTo(0, -40);
        context.closePath();
        context.fill();
        context.stroke();
    }

    function board(context) {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = 'grey';
        context.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            context.moveTo(i * 40, 0);
            context.lineTo(i * 40, canvas.height);
            context.stroke();
        }
        for (let i = 0; i < 20; i++) {
            context.moveTo(0, i * 40);
            context.lineTo(canvas.width, i * 40);
            context.stroke();
        }
    }

    /*
    function pieces(context, num, color, x, y, down) {
        context.fillStyle = color;
        context.save();
        context.translate(x, y);
        if (num == 1) {
            context.save();
                block(context);
                if (!down) currBlock.push({"x": x, "y": y});
                context.translate(40, 0);
                block(context);
                if (!down) currBlock.push({"x": x + 40, "y": y});
                context.translate(0, -40);
                block(context);
                currBlock.push({"x": x + 40, "y": y - 40});
                context.translate(-40, 0);
                block(context);
                currBlock.push({"x": x, "y": y - 40});
            context.restore();
        } else if (num == 2) {
            context.save();
                block(context);
                currBlock.push({"x": x, "y": y});
                context.translate(0, -40);
                block(context);
                currBlock.push({"x": x, "y": y - 40});
                context.translate(0, -40);
                block(context);
                currBlock.push({"x": x, "y": y - 80});
                context.translate(0, -40);
                block(context);
                currBlock.push({"x": x, "y": y - 120});
            context.restore();
        } else if (num == 3) {
            context.save();
                block(context);
                currBlock.push({"x": x, "y": y});
                context.translate(40, 0);
                block(context);
                currBlock.push({"x": x + 40, "y": y});
                context.translate(0, -40);
                block(context);
                currBlock.push({"x": x + 40, "y": y - 40});
                context.translate(40, 0);
                block(context);
                currBlock.push({"x": x + 80, "y": y - 40});
            context.restore();
        } else if (num == 4) {
            context.save();
                context.translate(0, -40);
                block(context);
                currBlock.push({"x": x, "y": y - 40});
                context.translate(40, 0);
                block(context);
                currBlock.push({"x": x + 40, "y": y - 40});
                context.translate(0, 40);
                block(context);
                currBlock.push({"x": x + 40, "y": y});
                context.translate(40, 0);
                block(context);
                currBlock.push({"x": x + 80, "y": y});
            context.restore();
        } else if (num == 5) {
            context.save();
                block(context);
                currBlock.push({"x": x, "y": y});
                context.translate(0, -40);
                block(context);
                currBlock.push({"x": x, "y": y - 40});
                context.translate(0, -40);
                block(context);
                currBlock.push({"x": x, "y": y - 80});
                context.translate(40, 80);
                block(context);
                currBlock.push({"x": x + 40, "y": y});
            context.restore();
        } else if (num == 6) {
            context.save();
                block(context);
                currBlock.push({"x": x, "y": y});
                context.translate(40, 0);
                block(context);
                currBlock.push({"x": x + 40, "y": y});
                context.translate(0, -40);
                block(context);
                currBlock.push({"x": x + 40, "y": y - 40});
                context.translate(0, -40);
                block(context);
                currBlock.push({"x": x + 40, "y": y - 80});
            context.restore();
        } else if (num == 7) {
            context.save();
                context.translate(0, -40);
                block(context);
                currBlock.push({"x": x, "y": y - 40});
                context.translate(40, 0);
                block(context);
                currBlock.push({"x": x + 40, "y": y - 40});
                context.translate(40, 0);
                block(context);
                currBlock.push({"x": x + 80, "y": y - 40});
                context.translate(-40, 40);
                block(context);
                currBlock.push({"x": x, "y": y});
            context.restore();
        }
        //console.log(currBlock)
        context.restore();
    }
    */

    function pieces(context, num, color, x, y, down) {
        context.fillStyle = color;
        context.save();
        context.translate(x, y);
        if (num === 1) {
            context.save();
            block(context);
            if (!down) currBlock.push({"x": x, "y": y});
            context.translate(40, 0);
            block(context);
            if (!down) currBlock.push({"x": x + 40, "y": y});
            context.translate(0, -40);
            block(context);
            if (!down) currBlock.push({"x": x + 40, "y": y - 40});
            context.translate(-40, 0);
            block(context);
            if (!down) currBlock.push({"x": x, "y": y - 40});
            context.restore();
        } else if (num === 2) {
            context.save();
            block(context);
            if (!down) currBlock.push({"x": x, "y": y});
            context.translate(0, -40);
            block(context);
            if (!down) currBlock.push({"x": x, "y": y - 40});
            context.translate(0, -40);
            block(context);
            if (!down) currBlock.push({"x": x, "y": y - 80});
            context.translate(0, -40);
            block(context);
            if (!down) currBlock.push({"x": x, "y": y - 120});
            context.restore();
        } else if (num === 3) {
            context.save();
            block(context);
            if (!down) currBlock.push({"x": x, "y": y});
            context.translate(40, 0);
            block(context);
            if (!down) currBlock.push({"x": x + 40, "y": y});
            context.translate(0, -40);
            block(context);
            if (!down) currBlock.push({"x": x + 40, "y": y - 40});
            context.translate(40, 0);
            block(context);
            if (!down) currBlock.push({"x": x + 80, "y": y - 40});
            context.restore();
        } else if (num === 4) {
            context.save();
            context.translate(0, -40);
            block(context);
            if (!down) currBlock.push({"x": x, "y": y - 40});
            context.translate(40, 0);
            block(context);
            if (!down) currBlock.push({"x": x + 40, "y": y - 40});
            context.translate(0, 40);
            block(context);
            if (!down) currBlock.push({"x": x + 40, "y": y});
            context.translate(40, 0);
            block(context);
            if (!down) currBlock.push({"x": x + 80, "y": y});
            context.restore();
        } else if (num === 5) {
            context.save();
            block(context);
            if (!down) currBlock.push({"x": x, "y": y});
            context.translate(0, -40);
            block(context);
            if (!down) currBlock.push({"x": x, "y": y - 40});
            context.translate(0, -40);
            block(context);
            if (!down) currBlock.push({"x": x, "y": y - 80});
            context.translate(40, 80);
            block(context);
            if (!down) currBlock.push({"x": x + 40, "y": y});
            context.restore();
        } else if (num === 6) {
            context.save();
            block(context);
            if (!down) currBlock.push({"x": x, "y": y});
            context.translate(40, 0);
            block(context);
            if (!down) currBlock.push({"x": x + 40, "y": y});
            context.translate(0, -40);
            block(context);
            if (!down) currBlock.push({"x": x + 40, "y": y - 40});
            context.translate(0, -40);
            block(context);
            if (!down) currBlock.push({"x": x + 40, "y": y - 80});
            context.restore();
        } else if (num === 7) {
            context.save();
            context.translate(0, -40);
            block(context);
            if (!down) currBlock.push({"x": x, "y": y - 40});
            context.translate(40, 0);
            block(context);
            if (!down) currBlock.push({"x": x + 40, "y": y - 40});
            context.translate(40, 0);
            block(context);
            if (!down) currBlock.push({"x": x + 80, "y": y - 40});
            context.translate(-40, 40);
            block(context);
            if (!down) currBlock.push({"x": x, "y": y});
            context.restore();
        }
        //console.log(currBlock)
        context.restore();
    }
    

    
    // Create a canvas element
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("myCanvas"));
    let context = canvas.getContext('2d');

    board(context);

    let size = currBlock.length;
    for (let i = 0; i < size; i++) {
        let c = currBlock[i];
        let x = c.x;
        let y = c.y; // Check for collision one step below
        //console.log(x, y);
        if (detectCollision(x, y)) { // Adjusted collision check
            curr.down = true;
            console.log(x, y);
            break;
        }
    }

    if (curr.y >= 800) {
        curr.down = true;
        console.log(curr.down);
    }

    if (curr.down) {
        prev = curr;
        for (let i = 0; i < currBlock.length; i++) {
            allSquares.push(currBlock[i]);
        }
        fallenTetros.push(prev);
        currBlock = [];
        make();
    } else {
        // Move current block down
        currBlock = [];
        curr.y += 4;
    }

    tetros.forEach(t => {
        pieces(context, t.type, t.color, t.x, t.y, t.down);
    });

    window.requestAnimationFrame(game);
}

make();
game();