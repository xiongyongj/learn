
const vs = `
    attribute vec4 a_position;
    uniform vec4 worldMat;
    uniform vec4 viewMat;

    void main() {
        gl_Position = viewMat * worldMat * a_position;
    }
`

const fs = `
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`

function createShader(gl, type, source) {
    let shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert("compile shader fail :" , gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initShaderProgram(gl, vs, fs) {
    let vShader = createShader(gl, gl.VERTEX_SHADER, vs);
    let fShader = createShader(gl, gl.FRAGMENT_SHADER, fs);

    const program = gl.createProgram();

    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("link program fail :", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

function initBuffer(gl) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    let vertex = [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);

    return buffer;
}

function drawScene(gl, program, buffer) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LSQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.COLOE_DEPTH_BIT);

    let viewMat = mat4.create();
    let fieldOfView = 45 * Math.PI / 180;
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 0.1;
    let zFar = 100.0;
    mat4.perspective(viewMat, fieldOfView, aspect, zNear, zFar);

    let worldMat = mat4.create();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(1);

    gl.useProgram(program);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "viewMat"), false, viewMat);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "worldMat"), false, worldMat);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}


import { mat4 } from './gl_matrix';

function main() {
    // console.log("main func");
    let canvas = document.querySelector("#glcanvas");
    console.log("canvas =>", canvas);
    let gl = canvas.getContext("webgl");
    console.log("gl ==>", gl);
    if (!gl) {
        alert("不支持webgl");
        return;
    }
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    let program = initShaderProgram(gl, vs, fs);
    let buffer = initBuffer(gl);
    drawScene(gl, program, buffer);
}
