/**
 * Sebastian Fojcik
 *
 * Obsługa myszy i klawiatury.
 */

canvas2d.addEventListener("keydown", keyPressed, false);
canvas2d.addEventListener("keyup", keyReleased, false);
canvas2d.addEventListener("mousedown", mousePressed, false);
canvas2d.addEventListener("mouseup", mouseReleased, false);
canvas2d.addEventListener("mousemove", mouseMoved, false);
canvas2d.addEventListener("wheel", wheel, false);
document.getElementById("console").addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.key === "Enter") {
            document.getElementById("execute").click();
        }
    });
const Key = {
    w: false,
    a: false,
    s: false,
    d: false,
    up: false,
    down: false,
    left: false,
    right: false,
    q: false,
    e: false
};

const Mouse = {
    x: 0,
    y: 0,
    clicked: false
};

function keyPressed(e) {
    switch(e.key) {
        case "ArrowRight": Key.right = true; break;
        case "ArrowLeft":  Key.left = true; break;
        case "ArrowUp":  Key.up= true; break;
        case "ArrowDown":  Key.down= true; break;
        case "w":  Key.w = true; break;
        case "a":  Key.a = true; break;
        case "s":  Key.s = true; break;
        case "d":  Key.d = true; break;
        case "q":  Key.q = true; break;
        case "e":  Key.e = true; break;
    }
}
function keyReleased(e) {
    switch(e.key) {
        case "ArrowRight": Key.right = false; break;
        case "ArrowLeft":  Key.left = false; break;
        case "ArrowUp":  Key.up= false; break;
        case "ArrowDown":  Key.down= false; break;
        case "w":  Key.w = false; break;
        case "a":  Key.a = false; break;
        case "s":  Key.s = false; break;
        case "d":  Key.d = false; break;
        case "q":  Key.q = false; break;
        case "e":  Key.e = false; break;
    }
}

function readKeys() {
    if(Key.a || Key.left) {
        world.rotation.y += 0.05;
    }
    if(Key.d || Key.right) {
        world.rotation.y -= 0.05;
    }
    if(Key.w) {
        world.rotation.x += 0.05;
    }
    if(Key.s) {
        world.rotation.x -= 0.05;
    }
    if(Key.up) {
        world.zoom += 0.05;
    }
    if(Key.down) {
        world.zoom -= 0.05;
    }
    if(Key.q) {

    }
    if(Key.e) {

    }
}

function mousePressed(e) {
    Mouse.clicked = true;
    Mouse.x = e.clientX;
    Mouse.y = e.clientY;
}
function mouseReleased() {
    Mouse.clicked = false;
}

/**
 * Obrót kamery po przytrzymaniu myszy na canvasie.
 */
function mouseMoved(e) {
    if(Mouse.clicked) {
        const x = e.clientX;
        const y = e.clientY;
        world.rotation.x += (y - Mouse.y) * Math.PI/360;
        world.rotation.y += (x - Mouse.x) * Math.PI/360;
        Mouse.x = x;
        Mouse.y = y;
    }
}

/**
 * Przybliżenie widoki przy użyciu scrolla
 */
function wheel(e) {
    // noinspection JSSuspiciousNameCombination
    const delta = Math.sign(e.deltaY);
    world.zoom -= 0.5* delta;
}