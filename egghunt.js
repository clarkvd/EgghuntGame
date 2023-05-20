import {mat4, vec4, vec3} from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm'

let cameraX = 0;
let cameraY = 0;
let cameraZ = 0;
let cameraRotateY = 0;

let canvas;
let gl;
let program;

let square;
let bunny;
let sphere;

class TriangleMesh {

    constructor(positionData, colorsData, normalsData, scale = vec3.fromValues(1, 1, 1)) {

        this.center = vec3.fromValues(0, 0, 0);
        this.rotate = vec3.fromValues(0, 0, 0);
        this.scale = scale;

        this.positionsData = positionData;
        this.positionsBuffer = null;
        this.positionsMemoryID = null;

        this.colorsData = colorsData;
        this.colorsBuffer = null;
        this.colorsMemoryID = null;

        this.normalsData = normalsData;
        this.normalsBuffer = null;
        this.normalsMemoryID = null;
    }

    shipStandardAttributes(positionsData, colorsData, normalsData) {

        this.positionsBuffer = gl.createBuffer();
        this.positionsMemoryID = gl.getAttribLocation(program, 'aVertexPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionsData), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // this unbinds the buffer, prevents bugs

        this.colorsBuffer = gl.createBuffer();
        this.colorsMemoryID = gl.getAttribLocation(program, 'aVertexColor');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsData), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // this unbinds the buffer, prevents bugs

        this.normalsBuffer = gl.createBuffer();
        this.normalsMemoryID = gl.getAttribLocation(program, 'aVertexNormal');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalsData), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // this unbinds the buffer, prevents bugs

    }

    getModelTransform() {

        const modelTransform = mat4.create();
        mat4.translate(
            modelTransform,
            modelTransform,
            vec3.fromValues(this.center[0], this.center[1], this.center[2])
        );
        mat4.rotateY(
            modelTransform,
            modelTransform,
            this.rotate[1],
        );
        mat4.scale(
            modelTransform,
            modelTransform,
            this.scale,
        );
        return modelTransform;

    }

    draw() {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionsBuffer);
        gl.vertexAttribPointer(this.positionsMemoryID, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.positionsMemoryID);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // and the colors too
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        gl.vertexAttribPointer(this.colorsMemoryID, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.colorsMemoryID);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // normals 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
        gl.vertexAttribPointer(this.normalsMemoryID, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.normalsMemoryID);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.drawArrays(gl.TRIANGLES, 0, this.positionsData.length / 3);

    }

}

export class egghunt {
    constructor(canvas, keyMap, bunnyVerticies, bunnyNormals, sphereVerticies, sphereNormals) {
        document.getElementById('Enhancements').innerHTML = "Enhancements completed: 1, 2, and 3";

        this.canvas = canvas;
        this.keyMap = keyMap;

        // Step 1. initialize the canvas
        this.canvas.width = 640;
        this.canvas.height = 480;

        // Step 2. initialize webgl context
        gl = canvas.getContext('webgl2', {
            antialias: false
        });
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Step 3. one-time compile the basic shader program
        program = this.compileBasicProgram(gl);
        gl.useProgram(program);


        const squarePositionsData = [-10, 0, -10, -10, 0, 10, 10, 0, 10, 10, 0, -10, -10, 0, -10, 10, 0, 10];
        const squareColorsData = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
        let squareNormalsData = [];
        
        // calculate the normals for each triangle
        for (let i = 0; i < squarePositionsData.length; i += 9) {
            const v1 = vec3.fromValues(squarePositionsData[i], squarePositionsData[i + 1], squarePositionsData[i + 2]);
            const v2 = vec3.fromValues(squarePositionsData[i + 3], squarePositionsData[i + 4], squarePositionsData[i + 5]);
            const v3 = vec3.fromValues(squarePositionsData[i + 6], squarePositionsData[i + 7], squarePositionsData[i + 8]);

            const e1 = vec3.sub(vec3.create(), v2, v1);
            const e2 = vec3.sub(vec3.create(), v3, v1);

            const normal = vec3.cross(vec3.create(), e1, e2);
            vec3.normalize(normal, normal);

            // add the same normal for each vertex of the triangle
            squareNormalsData.push(normal[0], normal[1], normal[2]);
            squareNormalsData.push(normal[0], normal[1], normal[2]);
            squareNormalsData.push(normal[0], normal[1], normal[2]);
        }
        square = new TriangleMesh(squarePositionsData, squareColorsData, squareNormalsData, vec3.fromValues(1, 1, 1))
        square.shipStandardAttributes(squarePositionsData, squareColorsData, squareNormalsData);
        square.center[2] = 0

        const bunnyPositionsData = bunnyVerticies;
        const bunnyColorsData = [];
        for (let i = 0; i < bunnyPositionsData.length; i += 3) {
            bunnyColorsData.push(1.0, 0.0, 0.5);
        }
        bunny = new TriangleMesh(bunnyPositionsData, bunnyColorsData, bunnyNormals, vec3.fromValues(1, 1, 1));
        bunny.shipStandardAttributes(bunnyPositionsData, bunnyColorsData, bunnyNormals);
        bunny.center[1] = 0.5

        this.eggs = []
        this.shadows = [];

        for (let j = 0; j < 7; j++) {
            const spherePositionsData = sphereVerticies;
            const sphereColorsData = [];
            for (let i = 0; i < spherePositionsData.length; i += 3) {
                sphereColorsData.push(0.5, 0.0, 1.0);
            }
            sphere = new TriangleMesh(spherePositionsData, sphereColorsData, sphereNormals, vec3.fromValues(0.15, 0.3, 0.2));
            sphere.shipStandardAttributes(spherePositionsData, sphereColorsData, sphereNormals);
            sphere.center[0] = Math.floor(Math.random() * 21) - 10;
            sphere.center[1] = 0.5
            sphere.center[2] = Math.floor(Math.random() * 21) - 10;
            this.eggs.push(sphere)

            const shadowScale = vec3.fromValues(0.25, 0.02, 0.25);
            const shadowPositionsData = sphereVerticies;
            const shadowNormalsData = sphereNormals;
            const shadowColorsData = [];
            for (let i = 0; i < shadowPositionsData.length; i += 3) {
                shadowColorsData.push(0.0, 0.0, 0.0);
            }
            const shadow = new TriangleMesh(shadowPositionsData, shadowColorsData, shadowNormalsData, shadowScale);
            shadow.shipStandardAttributes(shadowPositionsData, shadowColorsData, shadowNormalsData);
            shadow.center[0] = sphere.center[0];
            shadow.center[1] = 0.01;
            shadow.center[2] = sphere.center[2];
            this.shadows.push(shadow);

        }

        this.latitude = Math.PI / 4;
        this.longitude = Math.PI / 4;

    }

    mainLoop() {
        // Compute the FPS
        // First get #milliseconds since previous draw
        const elapsed = performance.now() - this.prevDraw;

        if (elapsed < 1000 / 60) {
            return;
        }
        // 1000 seconds = elapsed * fps. So fps = 1000/elapsed
        const fps = 1200 / elapsed;
        // Write the FPS in a <p> element.
        document.getElementById('fps').innerHTML = fps;

        this.update();
        this.draw();
    }

    draw() {

        // clear canvas, reset buffers, enable depth test
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);


        // Now draw the tent:
        // Step 1. Prepare perspective and view matrices
        const perspectiveTransform = mat4.create();
        mat4.perspective(
            perspectiveTransform, // where to store the result
            Math.PI / 2, // "vertical field of view"
            1, // "aspect ratio"
            0.1, // distance to near plane
            1000 // distance to far plane
        );

        const radius = 2;
        const cameraPosition = vec3.create();
        cameraPosition[0] = radius * Math.sin(this.latitude) * Math.cos(this.longitude);
        cameraPosition[1] = radius * Math.cos(this.latitude);
        cameraPosition[2] = radius * Math.sin(this.latitude) * Math.sin(this.longitude);
        vec3.add(cameraPosition, cameraPosition, bunny.center);

        const viewTransform = mat4.create();
        mat4.lookAt(
            viewTransform,
            cameraPosition,
            bunny.center,
            vec3.fromValues(0, 1, 0),
        );

        let modelTransform = square.getModelTransform()
        this.shipTransforms(gl, program, perspectiveTransform, viewTransform, modelTransform);
        square.draw()

        let bunnyModelTransform = bunny.getModelTransform()
        this.shipTransforms(gl, program, perspectiveTransform, viewTransform, bunnyModelTransform);
        bunny.draw()


        for (let i = 0; i < this.eggs.length; i++) {
            this.eggs[i].center[1] = 0.5 + 0.1 * Math.sin(performance.now() * 0.005);
            let sphereModelTransform = this.eggs[i].getModelTransform()
            this.shipTransforms(gl, program, perspectiveTransform, viewTransform, sphereModelTransform);
            this.eggs[i].draw()

        }

        for (let i = 0; i < this.shadows.length; i++) {
            let shadowModelTransform = this.shadows[i].getModelTransform();
            this.shipTransforms(gl, program, perspectiveTransform, viewTransform, shadowModelTransform);
            this.shadows[i].draw();
        }


        this.prevDraw = performance.now()

    }

    changeColor(newColor) {
        const bunnyColorsData = [];
        for (let i = 0; i < bunny.positionsData.length; i += 3) {
            bunnyColorsData.push(newColor[0], newColor[1], newColor[2]);
        }
        bunny.colorsData = bunnyColorsData;
        bunny.shipStandardAttributes(bunny.positionsData, bunny.colorsData, bunny.normalsData);
    }

    compileBasicProgram(gl) {
        
        const shaderProgram = gl.createProgram();
        const vertexShaderCode = `#version 300 es
        precision mediump float;

        in vec3 aVertexPosition;
        in vec3 aVertexColor;
        in vec3 aVertexNormal;

        uniform mat4 uPerspectiveTransform; 
        uniform mat4 uViewTransform;
        uniform mat4 uModelTransform;

        out vec3 pt;
        out vec3 n;
        out vec3 color;

        void main(void) {
            vec4 homogenized = vec4(aVertexPosition, 1.0);
            gl_Position = uPerspectiveTransform * uViewTransform * uModelTransform * homogenized;

            vec4 nHomogenized = vec4(aVertexNormal, 0.0);
            vec4 n4 = uModelTransform * nHomogenized;
            n =vec3(n4.x,n4.y,n4.z);

            vec4 pt4 = uModelTransform * homogenized;
            pt = vec3(pt4.x,pt4.y,pt4.z);


            color = aVertexColor;
        }
        `;
        
        
        
        
        
        const vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShaderObject, vertexShaderCode);
        gl.compileShader(vertexShaderObject);

        // good idea to check that it compiled successfully
        if (!gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(vertexShaderObject));
        }

        // next, the fragment shader codedw
        
        
        const fragmentShaderCode = `#version 300 es
        precision mediump float;
        out vec4 FragColor;

        in vec3 color;
        in vec3 n;
        in vec3 pt;


        vec3 calculateLighting(vec3 light, vec3 n, vec3 pt) {
            vec3 t = light - pt;
            float m = dot(n, t) / (length(n) * length(t));

            return max(vec3(0.0), m*0.4);
        }

        void main(void) {
            vec3 light1 = vec3(5.0, 1.5, 5.0);
            vec3 light2 = vec3(-5.0, 1.5, 5.0);
            vec3 light3 = vec3(5.0, 1.5, -5.0);

            vec3 m1 = calculateLighting(light1, n, pt);
            vec3 m2 = calculateLighting(light2, n, pt);
            vec3 m3 = calculateLighting(light3, n, pt);

            vec3 m = m1 + m2 + m3;

            FragColor = vec4((m+0.2)*color, 1.0);
        }
        `;

        // send this fragment shader source code to the GPU
        const fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShaderObject, fragmentShaderCode);

        // tell GPU to compile it
        gl.compileShader(fragmentShaderObject);

        // good idea to check that it compiled successfully
        if (!gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(fragmentShaderObject));
        }

        // attach each of the shaders to the shader program we created earlier
        gl.attachShader(shaderProgram, vertexShaderObject);
        gl.attachShader(shaderProgram, fragmentShaderObject);

        // tell GPU to "link" and "use" our program
        gl.linkProgram(shaderProgram);
        return shaderProgram;
    }

    shipTransforms(gl, program, projectionTransform, viewTransform, modelTransform) {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uPerspectiveTransform'), false, projectionTransform);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uViewTransform'), false, viewTransform);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uModelTransform'), false, modelTransform);
    }

    checkIntersection(position1, position2, radius1, radius2) {
        const distance = vec3.distance(position1, position2);
        return distance <= (radius1 + radius2);
    }

    update() {
        if (this.keyMap['w']) {
            const moveSpeed = 0.25;
            const angle = bunny.rotate[1];
            const deltaX = moveSpeed * Math.sin(angle);
            const deltaZ = moveSpeed * Math.cos(angle);

            bunny.center[0] += deltaX;
            bunny.center[2] += deltaZ;
            cameraX += deltaX;
            cameraZ += deltaZ;
        }
        if (this.keyMap['a']) {
            bunny.rotate[1] += .25

        }
        if (this.keyMap['d']) {
            bunny.rotate[1] -= .25

        }

        for (let i = 0; i < this.eggs.length; i++) {
            const eggPos = this.eggs[i].center;
            const bunnyPos = bunny.center;
            const distance = vec3.distance(eggPos, bunnyPos);

            if (distance < 0.75) {
                this.eggs.splice(i, 1);
                this.shadows.splice(i, 1);
                i--;
            }
        }

        if (this.eggs.length === 0) {
            this.changeColor([0.5, 0.0, 0.5]);
        }

        const orbitSpeed = 0.025;
        if (this.keyMap['j']) {
            this.longitude += orbitSpeed;
        }
        if (this.keyMap['l']) {
            this.longitude -= orbitSpeed;
        }
        if (this.keyMap['i']) {
            this.latitude -= orbitSpeed;
        }
        if (this.keyMap['k']) {
            this.latitude += orbitSpeed;
        }
        
        const minLatitude = 0.001; 
        const maxLatitude = Math.PI / 2 - 0.001; 
        this.latitude = Math.max(minLatitude, Math.min(maxLatitude, this.latitude));


        if (bunny.center[0] < -10) {
            bunny.center[0] = -10;
        }
        if (bunny.center[0] > 10) {
            bunny.center[0] = 10;
        }
        if (bunny.center[2] < -10) {
            bunny.center[2] = -10;
        }
        if (bunny.center[2] > 10) {
            bunny.center[2] = 10;
        }


    }

}

