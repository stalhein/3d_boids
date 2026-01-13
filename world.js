
export class World {
    constructor(gl) {
        this.gl = gl;

        this.floorVertices = [];
        this.floorVao = null;
        this.floorVbo = null;
    }

    createFloorMesh() {
        const gl = this.gl;

        for (let x = 0; x < 500; ++x) {
            for (let z = 0; z < 500; ++z) {
                this.floorVertices.push(x, 0, z, x+1, 0, z, x+1, 0, z+1);
                this.floorVertices.push(x, 0, z, x, 0, z+1, x+1, 0, z+1);
            }
        }

        this.floorVao = gl.createVertexArray();
        this.floorVbo = gl.createBuffer();

        gl.bindVertexArray(this.floorVao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.floorVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.floorVertices), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 3 * 4, 0);

        gl.bindVertexArray(null);
    }

    render() {
        const gl = this.gl;
        gl.bindVertexArray(this.floorVao);
        gl.drawArrays(gl.LINES, 0, this.floorVertices.length / 3);
    }
}