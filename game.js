// @ts-check

let colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan'];
let tetros = [];
let prev, curr;

function make() {
    let num = Math.floor(Math.random() * 7) + 1;
    let color = colors[Math.floor(Math.random() * colors.length)];
    let x = Math.floor(Math.random() * 7) * 40;
    let y = 0;
    let topY = 0;
    let rightX = 0;
    if (num == 1) {
        topY = y - 40;
    } else if (num == 2) {
        topY = y - 120;
    } else if (num == 3) {
        topY = y - 80;
    } else if (num == 4) {
        topY = y - 80;
    } else if (num == 5) {
        topY = y - 120;
    } else if (num == 6) {
        topY = y - 120;
    } else {
        topY = y - 40;
    }
    tetros.push({"type": num, "color": color, "x": x, "y": y, "up": topY, "down": false});
    curr = tetros[tetros.length - 1];
}

function game() {
    function block(context) {
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

    function pieces(context, num, color, x, y) {
        context.fillStyle = color;
        context.save();
        context.translate(x, y);
        if (num == 1) {
            context.save();
                block(context);
                context.translate(40, 0);
                block(context);
                context.translate(0, -40);
                block(context);
                context.translate(-40, 0);
                block(context);
            context.restore();
        } else if (num == 2) {
            context.save();
                block(context);
                context.translate(0, -40);
                block(context);
                context.translate(0, -40);
                block(context);
                context.translate(0, -40);
                block(context);
            context.restore();
        } else if (num == 3) {
            context.save();
                context.translate(0, -40);
                block(context);
                context.translate(40, 0);
                block(context);
                context.translate(0, 40);
                block(context);
                context.translate(40, 0);
                block(context);
            context.restore();
        } else if (num == 4) {
            context.save();
                block(context);
                context.translate(40, 0);
                block(context);
                context.translate(0, -40);
                block(context);
                context.translate(40, 0);
                block(context);
            context.restore();
        } else if (num == 5) {
            context.save();
                block(context);
                context.translate(0, -40);
                block(context);
                context.translate(0, -40);
                block(context);
                context.translate(40, 0);
                block(context);
            context.restore();
        } else if (num == 6) {
            context.save();
                block(context);
                context.translate(0, -40);
                block(context);
                context.translate(0, -40);
                block(context);
                context.translate(-40, 0);
                block(context);
            context.restore();
        } else if (num == 7) {
            context.save();
                block(context);
                context.translate(40, 0);
                block(context);
                context.translate(40, 0);
                block(context);
                context.translate(-40, -40);
                block(context);
            context.restore();
        }
        context.restore();
    }

    // Create a canvas element
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("myCanvas"));
    let context = canvas.getContext('2d');

    board(context);

    let shouldStop = false;

    tetros.forEach(t => {
        if (!shouldStop) {
            if (curr.y >= t.up && curr !== t) {
                shouldStop = true;
                prev = curr;
                make();
            }
        }
    });

    if (!shouldStop) {
        if (curr.y < 800) {
            curr.y += 2;
            curr.up += 2;
        } else {
            prev = curr;
            make();
        }
    }

    //if (curr.y < 800) {
    //    curr.y += 2;
    //    curr.up += 2;
    //} else {
    //    prev = curr;
    //    make();
    //}

    tetros.forEach(t => {
        pieces(context, t.type, t.color, t.x, t.y);
    });

    window.requestAnimationFrame(game);
}

make();
game();