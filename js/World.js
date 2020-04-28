/**
 * Sebastian Fojcik
 */

/**
 * Klasa zarządzająca obszarem świata.
 */
class World {

    /**
     * @param webgl referencja do instancji WebGL
     * @param canvas referencja do płótna 3D
     */
    constructor(webgl, canvas) {
        this.webgl = webgl;
        this.canvas = canvas;

        this.rotation = {
            x: 0.2,
            y: 0.0,
        };
        this.zoom = 0.0;
        this.light = {
            pos: [-5.0, 5.0, 5.0],
            color: [1.0, 1.0, 1.0],
            ambient: 0.2
        };

        this.worldMatrix = new Float32Array(16);
        this.viewMatrix = new Float32Array(16);
        this.projectionMatrix = new Float32Array(16);

        this.xRotationMatrix = new Float32Array(16);
        this.yRotationMatrix = new Float32Array(16);
    }

    /**
     * Aktualizuje wygląd świata.
     */
    update() {
        this._setPerspective();
        this._setZoom(this.zoom);
        this._setRotation(this.rotation);
        this._setLight(this.light);
    }

    /**
     * Włącza lub wyłącza mgłę.
     */
    setFog(state) {
        this.webgl.gl.uniform1i(this.webgl.isFog_UniformLocation, state ? 1 : 0);
    }

    /**
     * Włącza lub wyłącza oświetlenie.
     */
    setLighting(state) {
        this.webgl.gl.uniform1i(this.webgl.isLighting_UniformLocation, state ? 1 : 0);
    }

    /**
     * Ustawia przybliżenie kamery.
     * @private
     */
    _setZoom(zoom) {
        const camera = [0, 0, 5 - zoom];
        mat4.lookAt(this.viewMatrix, camera, [0, 0, 0], [0, 1, 0]);
        this.webgl.gl.uniformMatrix4fv(this.webgl.matView_UniformLocation, false, this.viewMatrix);
    }

    /**
     * Ustawia obrót kamery.
     * @private
     */
    _setRotation(rotation) {
        let xAxis = [1, 0, 0];
        vec3.rotateY(xAxis, xAxis, [0,0,0], -rotation.y);
        mat4.fromRotation(this.xRotationMatrix, rotation.x, xAxis);
        mat4.fromRotation(this.yRotationMatrix, rotation.y, [0, 1, 0]);

        mat4.mul(this.worldMatrix, this.yRotationMatrix, this.xRotationMatrix);
        this.webgl.gl.uniformMatrix4fv(this.webgl.matWorld_UniformLocation, false, this.worldMatrix);
    }

    /**
     * Ustawia światło w świecie (pozycję, kolor, natężenie).
     * @private
     */
    _setLight(light) {
        const gl = this.webgl.gl;
        gl.uniform1f(this.webgl.ambientStrength_UniformLocation, light.ambient);
        gl.uniform3fv(this.webgl.lightColor_UniformLocation, light.color);
        gl.uniform3fv(this.webgl.lightPos_UniformLocation, light.pos);
    }

    /**
     * Ustawia macierz perspektywy dla świata.
     * @private
     */
    _setPerspective() {
        const gl = this.webgl.gl;
        mat4.perspective(this.projectionMatrix, glMatrix.toRadian(45),
            this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000.0);
        gl.uniformMatrix4fv(this.webgl.matProj_UniformLocation, false, this.projectionMatrix);
    }
}