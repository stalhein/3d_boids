import {Camera} from "./camera.js";
import {Shader} from "./shader.js";
import {Boid} from "./boid.js";
import { mat4, vec3 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext("webgl2");
if (!gl) {
    console.log("WebGL2 not supported.");
}

gl.viewport(0, 0, canvas.width, canvas.height);
gl.enable(gl.DEPTH_TEST);

const camera = new Camera();
const shader = new Shader(gl, "shaders/vertex.glsl", "shaders/fragment.glsl");
await shader.load();

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const boids = [];

for (let i = 0; i < 200; ++i) {
    boids.push(new Boid(gl, [(Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100],
                            [(Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2]));
}

let lastTime = performance.now();
function loop(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    camera.update(dt);

    for (const boid of boids) {
        boid.update(dt);
    }

    gl.clearColor(0.4, 0.6, 0.5, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT, gl.COLOR_BUFFER_BIT);

    const projection = mat4.create();
    mat4.perspective(
        projection,
        Math.PI / 3,
        canvas.width / canvas.height,
        0.1,
        1000.0
    );
    const view = camera.getViewMatrix();

    shader.use();
    shader.setMat4("uProjection", projection);
    shader.setMat4("uView", view);

    for (const boid of boids) {
        shader.setMat4("uModel", boid.model);
        boid.render();
    }


    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);