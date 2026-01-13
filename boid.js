import { mat4, vec3 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

export class Boid {
    constructor(gl, position, velocity) {
        this.gl = gl;

        this.position = position;
        this.velocity = velocity;

        this.model = mat4.create();

        this.vbo = null;
        this.vao = null;

        this.vertices = [
            // Left face
            0, 0, 0,
            0, 1, 0,
            0, 1, 1,

            0, 0, 0,
            0, 1, 1,
            0, 0, 1,

            // Right face
            1, 0, 0,
            1, 0, 1,
            1, 1, 1,

            1, 0, 0,
            1, 1, 1,
            1, 1, 0,

            // Bottom face
            0, 0, 0,
            0, 0, 1,
            1, 0, 1,

            0, 0, 0,
            1, 0, 1,
            1, 0, 0,

            // Top face
            0, 1, 0,
            1, 1, 0,
            1, 1, 1,

            0, 1, 0,
            1, 1, 1,
            0, 1, 1,

            // Back face
            0, 0, 0,
            1, 0, 0,
            1, 1, 0,

            0, 0, 0,
            1, 1, 0,
            0, 1, 0,

            // Front face
            0, 0, 1,
            0, 1, 1,
            1, 1, 1,

            0, 0, 1,
            1, 1, 1,
            1, 0, 1
        ];

        this.init();
    }

    init() {
        const gl = this.gl;

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();

        gl.bindVertexArray(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 3 * 4, 0);

        gl.bindVertexArray(null);
    }

    update(dt) {
        const deltaVelocity = vec3.create();
        vec3.scale(deltaVelocity, this.velocity, dt);
        vec3.add(this.position, this.position, deltaVelocity);

        mat4.identity(this.model);
        mat4.translate(this.model, this.model, vec3.fromValues(this.position[0], this.position[1], this.position[2]));
    }

    render() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
    }
}