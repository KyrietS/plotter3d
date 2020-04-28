/**
 * Sebastian Fojcik
 */

const canvas = document.getElementById("canvas-3d");
const input = document.getElementById("console");
const canvas2d = document.getElementById("canvas-2d");
const ctx = canvas2d.getContext("2d");

let world = null;
let graph = null;
let plane = null;

/**
 * Funkcja inicjująca działanie aplikacji.
 */
function init() {
    /**
     * Inicjalizacja globalnego obiektu WebGL.
     * @type {WebGL}
     */
    webgl = new WebGL(canvas);
    webgl.useProgram();

    /**
     * Utworzenie obiektu świata, który zarządza kamerą, obrotami itd.
     * @type {World}
     */
    world = new World(webgl, canvas);

    /**
     * Wykres 3D.
     * @type {Graph}
     */
    graph = new Graph(webgl,250);

    /**
     * Płaszczyzna y = 0.
     * @type {Plane}
     */
    plane = new Plane(webgl);

    graph.update();
    showCredits();
    const loop = function () {
        webgl.clear();          // Wyczyść ekran.
        readKeys();             // Przetworzenie wciśniętych klawiszy.
        world.update();         // Aktualizacja świata, kamery, obrotów.

        plane.draw();
        graph.draw();

        webgl.finish();
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

/**
 * Wyczyszczenie widoku.
 */
function reset() {
    input.value = "";
    execute();
}

// noinspection JSUnresolvedVariable
document.getElementById("fog-checkbox")
    .addEventListener('change', (e) => world.setFog(e.target.checked));
// noinspection JSUnresolvedVariable
document.getElementById("thermal-checkbox")
    .addEventListener('change', (e) => graph.setThermal(e.target.checked));
// noinspection JSUnresolvedVariable
document.getElementById("lighting-checkbox")
    .addEventListener('change', (e) => world.setLighting(e.target.checked));
// noinspection JSUnresolvedVariable
document.getElementById("y0-checkbox")
    .addEventListener('change', (e) => plane.show = e.target.checked);

document.getElementById("style-plane-radio")
    .addEventListener("change", () => graph.setStyle("plane"));
document.getElementById("style-lines-radio")
    .addEventListener("change", () => graph.setStyle("lines"));
document.getElementById("style-dots-radio")
    .addEventListener("change", () => graph.setStyle("dots"));

$('#density-chooser').jRange({
    from: 1,
    to: 500,
    step: 10,
    scale: [1,100,200,300,400,500],
    format: '%s',
    width: 300,
    showLabels: true,
    snap: true,
    ondragend: (density) => { graph.setDensity(density); },
    onbarclicked: (density) => { graph.setDensity(density); }
});
$('#range-chooser').jRange({
    from: -10,
    to: 10,
    step: 0.5,
    scale: [-10,-5,0,5,10],
    format: '%s',
    width: 300,
    showLabels: true,
    isRange : true,
    snap: true,
    ondragend: (e) => { graph.setRange(...e.split(",")); graph.update(); },
    onbarclicked: (e) => { graph.setRange(...e.split(",")); graph.update(); }
});
$('#scale-chooser').jRange({
    from: -2.0,
    to: 2.0,
    step: 0.01,
    scale: [-2.0,-1.0,0.0,1.0,2.0],
    format: '%s',
    width: 300,
    showLabels: true,
    snap: false,
    ondragend: (scale) => { graph.setScale(scale); graph.update() },
    onbarclicked: (scale) => { graph.setScale(scale); graph.update() }
});

function execute() {
    let formula = input.value;
    formula = formula.split("sin").join("Math.sin");        // sin(x) -> Math.sin(x)
    formula = formula.split("cos").join("Math.cos");        // cos(x) -> Math.cos(x)
    formula = formula.split("tan").join("Math.tan");        // tan(x) -> Math.tan(x)
    formula = formula.split("sqrt").join("Math.sqrt");      // sqrt(x) -> Math.sqrt(x)
    formula = formula.split("pow").join("Math.pow");        // pow(x,y) -> Math.pow(x,y)
    formula = formula.split("log2(").join("Math.log2(");        // log2(x,y) -> Math.log2(x,y)
    formula = formula.split("log(").join("Math.log(");        // log(x,y) -> Math.log(x,y)

    try{
        const func = Function("x", "y", "return " + formula);
        graph.setFunction(func);
        graph.update();
    } catch(error) {
        document.getElementById("error-table").style.visibility = "visible";
        console.log(error);
    }
}

function example1() {
    input.value = "sin(x)*cos(y)";
    $('#range-chooser').jRange('setValue', '-5,5');
    $('#scale-chooser').jRange('setValue', '0.5');
    graph.setRange(-5,5);
    graph.setScale(0.5);
    execute();
}
function example2() {
    input.value = "x*y + 0.3";
    $('#range-chooser').jRange('setValue', '-1,1');
    $('#scale-chooser').jRange('setValue', '1.5');
    graph.setRange(-1,1);
    graph.setScale(1.5);
    execute();
}
function example3() {
    input.value = "sin(10*(x*x+y*y))/10";
    $('#range-chooser').jRange('setValue', '-1.5,1.5');
    $('#scale-chooser').jRange('setValue', '1.5');
    graph.setRange(-1.5,1.5);
    graph.setScale(1.5);
    execute();
}

function example4() {
    input.value = "((1-Math.sign(-x-.9+Math.abs(y*2)))/3*(Math.sign(.9-x)+1)/3)*" +
        "(Math.sign(x+.65)+1)/2 - ((1-Math.sign(-x-.39+Math.abs(y*2)))/3*(Math.sign(.9-x)+1)/3)" +
        " + ((1-Math.sign(-x-.39+Math.abs(y*2)))/3*(Math.sign(.6-x)+1)/3)*(Math.sign(x-.35)+1)/2";
    $('#range-chooser').jRange('setValue', '-1.0,1.0');
    $('#scale-chooser').jRange('setValue', '1.0');
    graph.setRange(-1.0,1.0);
    graph.setScale(1.0);
    execute();
}

function example5() {
    input.value = "(Math.sign(0.2-(x*x+y*y)) + Math.sign(0.2-(x*x/3+y*y/3)))/3 +0.67";
    $('#scale-chooser').jRange('setValue', '1.0');
    $('#range-chooser').jRange('setValue', '-1.0,1.0');
    graph.setRange(-1.0,1.0);
    graph.setScale(1.0);
    execute();
}

function showCredits() {
    ctx.save();
    ctx.font = "12px Lucida Console";
    ctx.fillStyle = "black";
    ctx.fillText("Wersja 1.0   Sebastian Fojcik", 5, 15);
    ctx.restore();
}