/**
 * Sebastian Fojcik
 */

/**
 * Klasa reprezentująca płaszczyznę y = 0.
 */
class Plane {
    /**
     * @param webgl referencja do instancji WebGL.
     */
    constructor(webgl) {
        this.webgl = webgl;
        this.color = [0.5, 0.5, 1.0];
        this.show = true;

        const gl = this.webgl.gl;
        this.vertices =
            [ // X, Y, Z           norX,norY,norZ
                // Bottom
                -1.0, 0.0, -1.0,   0.0, 1.0, 0.0,
                -1.0, 0.0, 1.0,    0.0, 1.0, 0.0,
                1.0, 0.0, 1.0,     0.0, 1.0, 0.0,
                1.0, 0.0, -1.0,    0.0, 1.0, 0.0,
            ];

        this.indices =
            [
                // Top
                0, 1, 2,
                0, 2, 3
            ];
        this.dataBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dataBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }

    /**
     * Rysowanie płaszczyzny y = 0.
     */
    draw() {
        if(!this.show) return;
        const gl = this.webgl.gl;
        this.webgl.gl.uniform3fv(this.webgl.fragColor_UniformLocation, this.color);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dataBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        this.webgl.setBufferAttribs();

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}