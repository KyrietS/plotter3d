/**
 * Sebastian Fojcik
 */

/** Globalna zmienna trzymająca kontekst WebGL */
let webgl;

/**
 * Klasa zarządzająca kontekstem WebGL.
 */
class WebGL {
    constructor(canvas) {
        this.gl = canvas.getContext('webgl');
        this.gl.getExtension('OES_element_index_uint');

        if (!this.gl) {
            console.log('WebGL not supported, falling back on experimental-webgl');
            this.gl = canvas.getContext('experimental-webgl');
        }
        if (!this.gl) {
            alert('Your browser does not support WebGL');
        }

        this.bgColor = [0.988, 1.0, 0.850];

        this.clear();
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    /**
     * Tworzy i uruchamia program na GPU.
     */
    useProgram() {
        this.vertexShader = this._createVertexShader(vertexShaderSource);
        this.fragmentShader = this._createFragmentShader(fragmentShaderSource);
        this.program = this._createProgram(this.vertexShader, this.fragmentShader);
        this.gl.useProgram(this.program);
        this._setUniformLocations();

        this.gl.uniform3fv(this.bgColor_UniformLocation, this.bgColor);
    }

    /**
     * Czyści ekran.
     */
    clear() {
        const gl = this.gl;
        gl.clearColor(...this.bgColor, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    }

    /**
     * Blokuje wykonywania dopóki poprzednie polecenia nie zostaną zakończone
     */
    finish() {
        this.gl.finish();
    }

    /**
     * Ustawia i włącza atrybuty dla bufora z wierzchołkami.
     */
    setBufferAttribs() {
        const gl = this.gl;
        const program = this.program;

        const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
        const normAttribLocation = gl.getAttribLocation(program, 'vertNorm');
        gl.vertexAttribPointer(
            positionAttribLocation,                     // Attribute location
            3,                                     // Number of elements per attribute
            gl.FLOAT,                           // Type of elements
            false,
            6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0                                   // Offset from the beginning of a single vertex to this attribute
        );
        gl.vertexAttribPointer(
            normAttribLocation,                // Attribute location
            3,                                  // Number of elements per attribute
            gl.FLOAT,                           // Type of elements
            false,
            6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            3 * Float32Array.BYTES_PER_ELEMENT  // Offset from the beginning of a single vertex to this attribute
        );

        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(normAttribLocation);
    }

    _setUniformLocations() {
        const gl = this.gl;
        const program = this.program;
        // Vertex Shader uniforms
        this.matWorld_UniformLocation = gl.getUniformLocation(program, 'mWorld');
        this.matView_UniformLocation = gl.getUniformLocation(program, 'mView');
        this.matProj_UniformLocation = gl.getUniformLocation(program, 'mProjection');
        // Fragment Shader uniforms
        this.fragColor_UniformLocation = gl.getUniformLocation(program, 'fragColor');
        this.bgColor_UniformLocation = gl.getUniformLocation(program, 'backgroundColor');
        this.isThermal_UniformLocation = gl.getUniformLocation(program, 'isThermal');
        this.isFog_UniformLocation = gl.getUniformLocation(program, 'isFog');
        this.isLighting_UniformLocation = gl.getUniformLocation(program, 'isLighting');
        this.lightColor_UniformLocation = gl.getUniformLocation(program, 'lightColor');
        this.lightPos_UniformLocation = gl.getUniformLocation(program, 'lightPos');
        this.ambientStrength_UniformLocation = gl.getUniformLocation(program, 'ambientStrength');
    }

    _createVertexShader(vertexShaderSource) {
        const gl = this.gl;
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
            throw new Error("Zakończono z powodu błędu");
        }
        return vertexShader;
    }
    _createFragmentShader(fragmentShaderSource) {
        const gl = this.gl;
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
            throw new Error("Zakończono z powodu błędu");
        }
        return fragmentShader;
    }

    _createProgram(vertexShader, fragmentShader) {
        const gl = this.gl;
        this.program = gl.createProgram();
        const program = this.program;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('ERROR linking program!', gl.getProgramInfoLog(program));
            return;
        }
        gl.validateProgram(program);
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            console.error('ERROR validating program!', gl.getProgramInfoLog(program));
            return;
        }
        return program;
    }
}