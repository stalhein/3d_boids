import { mat4, vec3 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

const FOV = Math.PI * 0.6;

const SEPERATION_DISTANCE = 50;
const ALIGNMENT_DISTANCE = 70;

const SEPERATION_MULTIPLIER = 5;
const ALIGNMENT_MULTIPLIER = 3;

const MAX_SPEED = 50;

const PADDING = 40;
const BOX_SIZE = 500;

export class Boid {
    constructor(gl, position, velocity) {
        this.gl = gl;

        this.position = position;
        this.velocity = velocity;

        this.speed = 50;

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

    update(dt, boids) {
        const seperation = vec3.create();
        const alignment = vec3.create();

        let alignmentsCount = 0;
        
        // Update based on other boids
        for (const boid of boids) {
            if (boid === this)  continue;

            const offset = vec3.subtract(vec3.create(), boid.position, this.position);
            
            const distance = vec3.length(offset);
            const direction = vec3.normalize(vec3.create(), offset);            

            // Seperation
            if (distance <= SEPERATION_DISTANCE) {
                const factor = 1 - distance / SEPERATION_DISTANCE;
                vec3.scaleAndAdd(seperation, seperation, direction, -factor);
            }

            // Check if in view
            const forward = vec3.normalize(vec3.create(), this.velocity);
            const dotProduct = vec3.dot(forward, direction);
            if (dotProduct < Math.cos(FOV))   continue;

            // Alignment
            if (distance <= ALIGNMENT_DISTANCE) {
                vec3.add(alignment, alignment, boid.velocity);
                alignmentsCount++;
            }
        }
        
        // Seperation
        vec3.scaleAndAdd(this.velocity, this.velocity, seperation, SEPERATION_MULTIPLIER);

        // Alignment
        if (alignmentsCount > 0) {
            vec3.scale(alignment, alignment, 1/alignmentsCount);
            vec3.scaleAndAdd(this.velocity, this.velocity, alignment, 1);
        }

        // Cohesion

        // Stop leaving
        if (this.position[0] < PADDING) this.velocity[0] += MAX_SPEED/3;
        if (this.position[1] < PADDING) this.velocity[1] += MAX_SPEED/3;
        if (this.position[2] < PADDING) this.velocity[2] += MAX_SPEED/3;

        if (this.position[0] > BOX_SIZE - PADDING) this.velocity[0] -= MAX_SPEED/3;
        if (this.position[1] > BOX_SIZE - PADDING) this.velocity[1] -= MAX_SPEED/3;
        if (this.position[2] > BOX_SIZE - PADDING) this.velocity[2] -= MAX_SPEED/3;

        // Move
        if (vec3.length(this.velocity) > MAX_SPEED) {
            vec3.normalize(this.velocity, this.velocity);
            vec3.scale(this.velocity, this.velocity, MAX_SPEED);
        }
        vec3.scaleAndAdd(this.position, this.position, this.velocity, dt);

        mat4.identity(this.model);
        mat4.translate(this.model, this.model, vec3.fromValues(this.position[0], this.position[1], this.position[2]));
    }

    render() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
    }
}