/**
 * Sebastian Fojcik
 */

/**
 * Klasa reprezentująca rysowany wykres funkcji.
 */
class Graph{
    /**
     * @param webgl referencja do instancji WebGL
     * @param size początkowe zagęszczenie punktów wykresu
     */
    constructor(webgl, size) {
        this.webgl = webgl;                                 // instancja WebGL
        this.size = size;                                   // liczba punktów w rzędzie
        this.color = [1.0, 0.0, 0.0];                       // kolor wykresu
        this.dataBuffer = this.webgl.gl.createBuffer();     // bufor na punkty wykresu
        this.indexBuffer = this.webgl.gl.createBuffer();    // bufor na indeksy punktów wykresu
        this.indices = null;                                // indeksy punktów wykresu
        this.grid = null;                                   // punkty wykresu
        this.func = null;                                   // rysowana funkcja
        this.scale = 1.0;                                   // stała skalująca wykres w pionie
        this.minRange = -5.0;                               // początek dziedziny (minRange, minRange)
        this.maxRange = 5.0;                                // koniec dziedziny (maxRange, maxRange)
        this.style = "plane";                               // tryb rysowania wykresu (plane|lines|dots)
        this.thermal = false;                               // tryb mapy cieplnej (true|false)

        this.updateIndices();
    }

    /**
     * Ustawia funkcję do narysowania
     * @param {Function} func rysowana funkcja
     */
    setFunction(func) {
        this.func = func;
    }

    /**
     * Ustawia skalowanie wykresu w pionie
     * @param {number|string} scale skala
     */
    setScale(scale) {
        this.scale = parseFloat(scale);
    }

    /**
     * Ustawia dziedzinę rysowanej funkcji
     * @param {number|string} minRange początek dziedziny (minRange, minRange)
     * @param {number|string} maxRange koniec dziedziny (maxRange, maxRange)
     */
    setRange(minRange, maxRange) {
        this.minRange = parseFloat(minRange);
        this.maxRange = parseFloat(maxRange);
    }

    /**
     * Ustawia tryb rysowania wykresu
     * @param {string} style tryb rysowania
     */
    setStyle(style) {
        this.style = style;
    }

    /**
     * Ustawia zagęszczenie punktów na wykresie.
     * Całkowita liczba punktów jest kwadratem tej wartości.
     * @param {number|string} density liczba punktów w pojedynczym rzędzie
     */
    setDensity(density) {
        this.size = parseInt(density);
        this.updateIndices();
        this.update();
    }

    /**
     * Włącza lub wyłącza tryb mapy cieplnej
     * @param {boolean} state
     */
    setThermal(state) {
        this.thermal = state;
        const isThermalUniformLocation = this.webgl.gl.getUniformLocation(this.webgl.program, 'isThermal');
        this.webgl.gl.uniform1i(isThermalUniformLocation, state ? 1 : 0);
    }

    /**
     * Aktualizuje wykres i generuje od nowa zbiór punktów.
     */
    update() {
        const gl = this.webgl.gl;
        if(this.func == null) return;
        this.grid = this._createGrid(this.func, this.scale, this.minRange, this.maxRange);
        this._fillGridWithNormals();
        // Utwórz tablicę będącą ciągiem liczb
        const data = this.grid.reduce( (data, elem) => {
            data.push(...elem.pos, ...elem.norm);
            return data;
        }, []);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dataBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
    }

    /**
     * Aktualizuje zbiór indeksów rysowanych punktów.
     */
    updateIndices() {
        const gl = this.webgl.gl;
        this.indices = this._getIndices();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), gl.DYNAMIC_DRAW);
    }

    /**
     * Rysuje wykres z wygenerowanych punktów.
     */
    draw() {
        if(this.grid == null) return;
        this.webgl.gl.uniform3fv(this.webgl.fragColor_UniformLocation, this.color);
        if(this.thermal)
            this.webgl.gl.uniform1i(this.webgl.isThermal_UniformLocation, this.thermal ? 1 : 0);

        switch(this.style) {
            case "plane": this._drawPlane(); break;
            case "lines": this._drawLines(); break;
            case "dots": this._drawPoints(); break;
        }
        this.webgl.gl.uniform1i(this.webgl.isThermal_UniformLocation, 0);
    }

    /**
     * Rysuje wykres jako płaszczyznę przybliżając ją trójkątami.
     * @private
     */
    _drawPlane() {
        const gl = this.webgl.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dataBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.webgl.setBufferAttribs();
        gl.drawElements(gl.TRIANGLE_STRIP, this.indices.length, gl.UNSIGNED_INT, 0);
    }

    /**
     * Rysuje wykres jako zbiór lewitujących punktów.
     * @private
     */
    _drawPoints() {
        const gl = this.webgl.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dataBuffer);
        this.webgl.setBufferAttribs();
        gl.drawArrays(gl.POINTS, 0, this.grid.length);
    }

    /**
     * Rysuje wykres jako zbiór połączonych ze sobą odcinków.
     * @private
     */
    _drawLines() {
        const gl = this.webgl.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dataBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.webgl.setBufferAttribs();
        gl.drawElements(gl.LINE_STRIP, this.indices.length, gl.UNSIGNED_INT, 0);
    }

    /**
     * Tworzy zbiór punktów
     * @param {Function} fun funkcja do narysowania
     * @param {number} scale stała skalowania wykresu
     * @param {number} min początek dziedziny
     * @param {number} max koniec dziedziny
     * @returns {[]} tablica z punktami
     * @private
     */
    _createGrid(fun, scale, min, max) {
        const size = this.size;
        const grid = [];
        const slopeMinMax = (max - min) / (size - 1);
        const slopeNorm = (1 - -1) / (max - min);
        for(let z = 0; z < size; z++) {
            for(let x = 0; x < size; x++) {
                const offset = z * size + x;
                // Mapowanie [0, size-1] do [min, max]
                let valueX = min + slopeMinMax * (x);
                let valueZ = min + slopeMinMax * (z);
                const valueY = fun(valueX, valueZ) * scale;
                // Mapowanie [min, max] do [-1, 1]
                valueX = -1 + slopeNorm * (valueX - min);
                valueZ = -1 + slopeNorm * (valueZ - min);
                grid[offset] = {
                    pos: [valueX, valueY, valueZ],
                    norm: [0.0, 0.0, 0.0]
                }
            }
        }
        return grid;
    }

    /**
     * Tworzy zbiór indeksów, który umożliwi rysowanie wykresu trybem STRIP.
     * @returns {[]} zbiór indeksów
     * @private
     */
    _getIndices() {
        const size = this.size;
        const indices = [];
        let y = 0;
        while(y < size-1) {
            for(let x = 0; x < size; x++) {
                const offset = y*size + x;
                indices.push(offset);
                indices.push(offset + size);
            }
            y++;
            if(y < size-1) {
                for(let x = size-1; x >= 0; x--) {
                    const offset = y*size + x;
                    indices.push(offset);
                    indices.push(offset + size);
                }
                y++
            }
        }

        return indices;
    }

    /**
     * Uzupełnia zbiór punktów (this.grid) o wartości wektorów normalnych.
     * @private
     */
    _fillGridWithNormals() {
        const grid = this.grid;
        const size = grid.length;       // Liczba elementów w siatce (= n*n)
        const n = this.size;            // Liczba elementów w wierszu
        if(n < 2) return;
        // Normalne na rogach siatki
        this._normal(0, n, 1);                              // Górny lewy
        this._normal(n-1, n-2, 2*n-1);                   // Górny prawy
        this._normal(size-n, size-n+1, size-n-n);       // Dolny lewy
        this._normal(size-1, size-n-1, size-2);            // Dolny prawy
        // Normalne na krawędziach siatki
        for(let i = 1; i < n-1; i++) {
            // Góra
            this._normal(i, i-1, i+n);
            this._normal(i, i+n, i+1);
            // Dół
            const j = size-n+i;
            this._normal(j,j+1, j-n );
            this._normal(j, j-n, j-1);
        }
        for(let i = n; i < size-n; i += n) {
            // Lewo
            this._normal(i, i+1, i-n);
            this._normal(i, i+n, i+1);
            // Prawo
            const j = i + n - 1;
            this._normal(j, j-n, j-1);
            this._normal(j, j-1, j+n);
        }
        // Normalne w punktach wewnątrz płaszczyzny
        for(let i = 1; i < n-2; i++) {
            for(let j = 1; j < n-2; j++) {
                const offset = i * n + j;
                this._normal(offset, offset+1, offset-n);       // Górny prawy
                this._normal(offset, offset+n, offset+1);       // Dolny prawy
                this._normal(offset, offset-1, offset+n);       // Dolny lewy
                this._normal(offset, offset+n, offset-n);       // Górny lewy
            }
        }
    }

    /**
     * Wyznacza wektor normalny dla wektorów ab i ac.
     * Wynik jest dodawany do pola grid[a].norm
     * @param a położenie punktu w siatce this.grid
     * @param b położenie punktu w siatce this.grid
     * @param c położenie punktu w siatce this.grid
     * @private
     */
    _normal(a, b, c) {
        const grid = this.grid;
        let norm = vec3.create();
        let v1 = vec3.create();
        let v2 = vec3.create();
        vec3.sub(v1, grid[b].pos, grid[a].pos);
        vec3.sub(v2, grid[c].pos, grid[a].pos);
        vec3.cross(norm, v1, v2);
        vec3.add(grid[a].norm, grid[a].norm, norm);
    }

}