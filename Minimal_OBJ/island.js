var gl;
var canvas;

var eye;
var target;
var up;

var vertices;
var colors;

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

var objects = {};

var RenderObject = function(transform, color, shaders, buffer, bufferLength){

	this.transform = transform;
	this.color = color;
	this.shader = shader;
	this.buffer = buffer;
	this.bufferLength = bufferLength;
	this.indexBuffer;

}

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

	defaultProgram = initShaders(gl, "vertex-shader", "fragment-shader");
	
	// Create water
	var waterString = document.getElementById("water").innerHTML;
	waterMesh = new OBJ.Mesh(waterString);
	OBJ.initMeshBuffers(gl, waterMesh);

	waterModelMatrix = mat4.create();

	// Create island
	var islandString = document.getElementById("island").innerHTML;
	islandMesh = new OBJ.Mesh(islandString);
	OBJ.initMeshBuffers(gl, islandMesh);
	
	islandModelMatrix = mat4.create();

	// Create palmtreelog
	var palmtreelogString = document.getElementById("palmtreelog").innerHTML;
	palmtreelogMesh = new OBJ.Mesh(palmtreelogString);
	OBJ.initMeshBuffers(gl, palmtreelogMesh);
	
	palmtreelogModelMatrix = mat4.create();

	//Create palmtreeleaves
	var palmtreeleavesString = document.getElementById("palmtreeleaves").innerHTML;
	palmtreeleavesMesh = new OBJ.Mesh(palmtreeleavesString);
	OBJ.initMeshBuffers(gl, palmtreeleavesMesh);
	
	palmtreeleavesModelMatrix = mat4.create();


	// Setup projectionMatrix (perspective)
	
	var fovy = Math.PI * 0.2; // 90 degrees
	var aspectRatio = canvas.width / canvas.height;
	var nearClippingPlane = 0.5;
	var farClippingPlane = 100;
	
	projectionMatrix = mat4.create();
	mat4.perspective(projectionMatrix, fovy, aspectRatio, nearClippingPlane, farClippingPlane);
	
	//setup viewMatrix (camera)

	eye = vec3.fromValues(-10.0, 1.0, -10.0);
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


	// Island
	// Set attribute
	var vPosition2 = gl.getAttribLocation(defaultProgram, "vPosition");
	gl.bindBuffer(gl.ARRAY_BUFFER, islandMesh.vertexBuffer);
	gl.vertexAttribPointer(vPosition2, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition2);
	
	// Set uniforms
	gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
	gl.uniformMatrix4fv(modelMatrixLoc, false, islandModelMatrix);
	gl.uniform4fv(colorLoc, vec4.fromValues(1, 1, 0, 1));

	// Draw
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, islandMesh.indexBuffer);
	gl.drawElements(gl.TRIANGLES, islandMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


	// Palmtreelog
	// Set attribute
	var vPosition3 = gl.getAttribLocation(defaultProgram, "vPosition");
	gl.bindBuffer(gl.ARRAY_BUFFER, palmtreelogMesh.vertexBuffer);
	gl.vertexAttribPointer(vPosition3, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition3);
	
	// Set uniforms
	gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
	gl.uniformMatrix4fv(modelMatrixLoc, false, palmtreelogModelMatrix);
	gl.uniform4fv(colorLoc, vec4.fromValues(0.545, 0.271, 0.075, 1));

	// Draw
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, palmtreelogMesh.indexBuffer);
	gl.drawElements(gl.TRIANGLES, palmtreelogMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	
	//Palmtreeleaves
	// Set attribute
	var vPosition4 = gl.getAttribLocation(defaultProgram, "vPosition");
	gl.bindBuffer(gl.ARRAY_BUFFER, palmtreeleavesMesh.vertexBuffer);
	gl.vertexAttribPointer(vPosition4, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition4);
	
	// Set uniforms
	gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
	gl.uniformMatrix4fv(modelMatrixLoc, false, palmtreeleavesModelMatrix);
	gl.uniform4fv(colorLoc, vec4.fromValues(0, 1, 0, 1));

	// Draw
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, palmtreeleavesMesh.indexBuffer);
	gl.drawElements(gl.TRIANGLES, palmtreeleavesMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	
	requestAnimFrame(render);
}


function handleKeyDown(event) 
{
	// Extract view direction for xz plane
	var viewDirection = vec3.fromValues(lookVector[0], 0, lookVector[2]);
	
	// Compute strafe direction
	var strafeDirection = vec3.fromValues(lookVector[2], 0, -lookVector[0]);
		
	// Up
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

function handleMouseMove(event) 
{
	// Remove the offset of the canvas rectangle from mouse coordinates
	
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

