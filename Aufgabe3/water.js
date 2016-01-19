var gl;
var canvas;

var eye;
var target;
var up;

var vertices;
var colors = [];

var colorBuffer;
var positionBuffer;

var modelMatrix;
var modelMatrixLoc;

var rotationY = 0.01;
var yAxis = vec3.fromValues(0, 1, 0);
var rotationX = 0.01;
var xAxis = vec3.fromValues(1, 0, 0);
var rotationZ = 0.01;
var zAxis = vec3.fromValues(0, 0, 1);

var projectionMatrix = mat4.create();
var projectionMatrixLoc;
var viewMatrix = mat4.create();
var viewMatrixLoc;

var lastMousePosX = 0;
var lastMousePosY = 0;

// Rotation around Y axis (according to mouse movements left and right)
var rotationAngleY = 0;
// Rotation around X axis (according to mouse movements up and down)
var rotationAngleX = 0;

var counter = 0;

var wavelength = 0;

var cameratoggled = true;

window.onload = function init()
{
	// Get canvas and setup webGL
	
	canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert("WebGL isn't available"); }
	
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);

	// Configure viewport

	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);

	// Init shader programs

	// init vertex colors
	for (var i = 0; i < 5000; i++){
		colors.push(0.0);
		colors.push(0.3);
		colors.push(1.0);
		colors.push(1.0);
		colors.push(0.0);
		colors.push(0.0);
		colors.push(1.0);
		colors.push(1.0);
		colors.push(0.0);
		colors.push(0.0);
		colors.push(1.0);
		colors.push(1.0);

		colors.push(0.0);
		colors.push(0.3);
		colors.push(1.0);
		colors.push(1.0);
		colors.push(0.0);
		colors.push(0.3);
		colors.push(1.0);
		colors.push(1.0);
		colors.push(0.0);
		colors.push(0.0);
		colors.push(1.0);
		colors.push(1.0);
	}
	var watercolor = new Float32Array(colors);
	defaultProgram = initShaders(gl, "vertex-shader", "fragment-shader");

	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, watercolor, gl.STATIC_DRAW);
	
	var vColor = gl.getAttribLocation(defaultProgram, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	// Create water
	var waterString = document.getElementById("water").innerHTML;
	waterMesh = new OBJ.Mesh(waterString);
	OBJ.initMeshBuffers(gl, waterMesh);

	waterModelMatrix = mat4.create();

	// Setup projectionMatrix (perspective)
	
	var fovy = Math.PI * 0.2; // 90 degrees
	var aspectRatio = canvas.width / canvas.height;
	var nearClippingPlane = 0.5;
	var farClippingPlane = 100;
	
	projectionMatrix = mat4.create();
	mat4.perspective(projectionMatrix, fovy, aspectRatio, nearClippingPlane, farClippingPlane);
	
	//setup viewMatrix (camera)

	eye = vec3.fromValues(-10.0, 5.0, -10.0);
	up = vec3.fromValues(0.0, 1.0, 0.0);

	lookVector= vec3.fromValues(0.0,0.0,-1.0);
	target = vec3.create();
	vec3.add(target, eye, lookVector);

	viewMatrix = mat4.create();
	mat4.lookAt(viewMatrix, eye, target, up);
    
    document.onkeydown = handleKeyDown;
    document.onmousemove = handleMouseMove;
    lastMousePosX = canvas.width/2;
    lastMousePosY = canvas.height/2;

	render();
};

function render()
{	

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// Set shader program
	gl.useProgram(defaultProgram);
	projectionMatrixLoc = gl.getUniformLocation(defaultProgram, "projectionMatrix");
	viewMatrixLoc = gl.getUniformLocation(defaultProgram, "viewMatrix");
	modelMatrixLoc = gl.getUniformLocation(defaultProgram, "modelMatrix");
	colorLoc = gl.getUniformLocation(defaultProgram, "objectColor");
	timeLoc = gl.getUniformLocation(defaultProgram, "time");

	// Speed of waveheight-change
	counter++;
	if(counter % 4 === 0){
		wavelength += 0.1;
		counter = 0;
	}
	gl.uniform1f(timeLoc, wavelength);

	// Water
	// Set attribute
	var vPosition1 = gl.getAttribLocation(defaultProgram, "vPosition");
	gl.bindBuffer(gl.ARRAY_BUFFER, waterMesh.vertexBuffer);
	gl.vertexAttribPointer(vPosition1, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition1);
	
	// Set uniforms
	gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
	gl.uniformMatrix4fv(modelMatrixLoc, false, waterModelMatrix);
	gl.uniform4fv(colorLoc, vec4.fromValues(0, 0, 1, 1));

	// Draw
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, waterMesh.indexBuffer);
	gl.drawElements(gl.TRIANGLES, waterMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	
	requestAnimFrame(render);
}


function handleKeyDown(event) 
{
	// Extract view direction for xz plane
	var viewDirection = vec3.fromValues(lookVector[0], 0, lookVector[2]);
	
	// Compute strafe direction
	var strafeDirection = vec3.fromValues(lookVector[2], 0, -lookVector[0]);
		
	// Up
	if(cameratoggled){
		if (String.fromCharCode(event.keyCode) == 'W') 
		{
			// Add view direction to eye position AND look vector to target
			vec3.add(eye, eye, viewDirection);
			vec3.add(target, eye, lookVector);
			mat4.lookAt(viewMatrix, eye, target, up);

			gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
		}
		// Down
		if (String.fromCharCode(event.keyCode) == 'S') 
		{
			// Subtract view direction to eye position AND look vector to target
			vec3.subtract(eye, eye, viewDirection);
			vec3.add(target, eye, lookVector);
			mat4.lookAt(viewMatrix, eye, target, up);

			gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
		}
		// Right
		if (String.fromCharCode(event.keyCode) == 'D') 
		{
			// Subtract strafe direction to eye position AND look vector to target
			vec3.subtract(eye, eye, strafeDirection);
			vec3.add(target, eye, lookVector);
			mat4.lookAt(viewMatrix, eye, target, up);

			gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
		}
		// Left
		if (String.fromCharCode(event.keyCode) == 'A') 
		{
			// Add strafe direction to eye position AND look vector to target
			vec3.add(eye, eye, strafeDirection);
			vec3.add(target, eye, lookVector);
			mat4.lookAt(viewMatrix, eye, target, up);

			gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
		}
	}
	// disable/enable camera movement
	if (String.fromCharCode(event.keyCode) == 'T')
	{
		cameratoggled = !cameratoggled;
	}
}

function handleMouseMove(event) 
{
	// Remove the offset of the canvas rectangle from mouse coordinates
	if(cameratoggled){
		var x = event.clientX - canvas.getBoundingClientRect().left;
		var y = event.clientY - canvas.getBoundingClientRect().top;
		
		var newX = lastMousePosX - x;
		lastMousePosX = x;
		
		var newY = lastMousePosY - y;
		lastMousePosY = y;
		
		// Translate mouse movement to angle: 1px = 1 degree
		rotationAngleY += Math.PI/180 * newX;
		rotationAngleX -= Math.PI/180 * newY;
		
		// Cut rotation angle between -45 and 45 degree
		if (rotationAngleX > Math.PI/4)
		{
			rotationAngleX = Math.PI/4;
		}
		else if (rotationAngleX < -Math.PI/4)
		{
			rotationAngleX = -Math.PI/4;
		}
		
		var rotationVector = vec3.create();
		var rotationMatrix = mat4.create();

		mat4.fromZRotation(rotationMatrix,rotationAngleX);
		vec3.transformMat4(rotationVector,vec3.fromValues(-1.0,0.0,0.0),rotationMatrix);
		
		mat4.fromYRotation(rotationMatrix,rotationAngleY);
		vec3.transformMat4(lookVector,rotationVector,rotationMatrix);
		
		vec3.add(target, eye, lookVector);

		mat4.lookAt(viewMatrix, eye, target, up);
		
		gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
	}
}

