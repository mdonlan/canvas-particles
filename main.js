// global data
let particles = [];
let canvas = document.querySelector(".canvas");
// set canvas to full window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext('2d');
let canvasHeight = canvas.height;
let canvasWidth = canvas.width;
let pointRadius = 3;
let frames = 0;
let particleSpeed = 3;
let oldParticleSpeed = null;
let startTime = null;
let endTime = null;
let connectionDistance = 100;
let oldConnectionDistance = null;
let numParticles = 20;
let oldNumParticles = null;
let draggingControlPanel = false;
let mouseIsDown = 0;
let moveX = null;
let moveY = null;

// set element refs
let fpsCounter = document.querySelector(".fpsCounter");
let particleSpeedElem = document.querySelector(".particleSpeed");
let connectionDistanceElem = document.querySelector(".connectionDistance");
let numParticlesElem = document.querySelector(".numParticles");
let controlPanelElem = document.querySelector(".controlPanel");
let numParticlesInput = document.querySelector(".numParticlesInput");
let particleSpeedInput = document.querySelector(".particleSpeedInput");
let connectionDistanceInput = document.querySelector(".connectionDistanceInput");

// event listeners
document.querySelector(".header").addEventListener("click", moveControlPanel);
document.querySelector("body").addEventListener("mousemove", movedMouse);
document.querySelector("body").addEventListener("mouseup", mouseUp);
document.querySelector("body").addEventListener("mousedown", mouseDown);

function mouseUp() {
  --mouseIsDown;
  //console.log('mouse up')
  draggingControlPanel = false;
}

function mouseDown(event) {
  if(event.target.classList[0] == 'header') {
    draggingControlPanel = true;
  }
  ++mouseIsDown;
  //console.log('mouse down')
  
}

function movedMouse(event) {
  //console.log(event)
  if(mouseIsDown == 1 && draggingControlPanel == true) {
    //console.log('dragging')
    let transform = controlPanelElem.style.transform;
    let transformX = transform.substring(transform.indexOf("(")+1,transform.indexOf("p"));
    let transformY = transform.substring(transform.indexOf(", ")+1,transform.lastIndexOf("p"));
    mouseX = event.clientX;
    console.log(mouseX)
    mouseY = event.clientY;
    requestAnimationFrame(updateMoved)
  }
}

function updateMoved() {
  //console.log(mouseX, mouseY)
  //console.log(controlPanelElem.style.transform)
  controlPanelElem.style.transform = "translate(" + mouseX + "px, " + mouseY + "px)";
}

function moveControlPanel() {
  //console.log('test')
  //draggingControlPanel = true;
}

function createParticle() {
  let x = Math.floor(Math.random() * canvasWidth) + 1;
  let y = Math.floor(Math.random() * canvasHeight) + 1;
  let velX = ((Math.floor(Math.random() * 10) - 5) / 50);
  let velY = ((Math.floor(Math.random() * 10) - 5) / 50);
  let color = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});

  let point = {
    x: x,
    y: y,
    velX: velX,
    velY: velY,
    color: color
  }
  
  particles.push(point);
};

function movePoint(point) {
  point.x+=point.velX * particleSpeed;
  point.y+=point.velY * particleSpeed;

  // check if new location will be inside canvas
  checkIfValidPosition(point)
}

function checkIfValidPosition(point) {
  if(point.x - pointRadius <= 0 || point.x + pointRadius >= canvas.width) {
    point.velX = -point.velX;
  }

  if(point.y - pointRadius <= 0 || point.y + pointRadius >= canvas.height) {
    point.velY = -point.velY;
  }
}

function drawPoint(point) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, pointRadius, 0, 2*Math.PI);
  ctx.fillStyle = point.color;
  ctx.strokeStyle = point.color;
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

function update() {
  if(startTime == null) {
    // if no start time create one
    startTime = Date.now();
  }

  // clear canvas of all previous particles
  clear();
  for(var i = 0; i < particles.length; i++) {
    // run for each point
    movePoint(particles[i]);
    drawPoint(particles[i]);
    findConnections(particles[i]);
    updateUI();
  }
  getFPS();
  window.requestAnimationFrame(update);
};

function changedUI(event) {
  // responds to user clicks that change UI data

  //numParticlesInput
  //particleSpeedInput
  //connectionDistanceInput

  // number of particles
  if(event.target.classList[0] == 'increaseNumParticles') {
    console.log('increasing connection dist')

    let numChange = parseInt(numParticlesInput.value);
    numParticles = numParticles + numChange;
    for(let i = 0; i < numChange; i++) {
      changeNumberParticles('add');
    }
  } else if(event.target.classList[0] == 'decreaseNumParticles') {
    console.log('decreasing connection dist')

    let numChange = parseInt(numParticlesInput.value);
    numParticles = numParticles - numChange;
    for(let i = 0; i < numChange; i++) {
      changeNumberParticles('remove');
    }
  } 

  // particle speed
  if(event.target.classList[0] == 'increaseParticleSpeed') {
    console.log('increasing speed')
    let numChange = parseInt(particleSpeedInput.value);
    particleSpeed = particleSpeed + numChange;
  } else if(event.target.classList[0] == 'decreaseParticleSpeed') {
    let numChange = parseInt(particleSpeedInput.value);
    particleSpeed = particleSpeed - numChange;
  } 

  // connection distance
  if(event.target.classList[0] == 'increaseConnectionDistance') {
    console.log('increasing connection dist')
    let numChange = parseInt(connectionDistanceInput.value);
    connectionDistance = connectionDistance + numChange;
  } else if(event.target.classList[0] == 'decreaseConnectionDistance') {
    console.log('decreasing connection dist')
    let numChange = parseInt(connectionDistanceInput.value);
    connectionDistance = connectionDistance - numChange;
  } 

}

function updateUI() {
  // runs in update, detects and changes to 
  // data that is in UI and updates

  // particle speed
  if(oldParticleSpeed != particleSpeed) {
    // if particle speed setting has changed
    particleSpeedElem.innerHTML = particleSpeed;
    oldParticleSpeed = particleSpeed;
    console.log('updating particle speed')
  }

  // connection distance
  if(oldConnectionDistance != connectionDistance) {
    // if particle speed setting has changed
    connectionDistanceElem.innerHTML = connectionDistance;
    oldConnectionDistance = connectionDistance;
    console.log('updating connection distance speed')
  }

  // number of particles
  if(oldNumParticles != numParticles) {
    // if particle speed setting has changed
    numParticlesElem.innerHTML = numParticles;
    oldNumParticles = numParticles;
    console.log('updating number of particles')
  }
};

function changeNumberParticles(event) {
  if(event == 'add') {
    // create a new particle and add it to particle array
    createParticle();
  } else if(event == 'remove') {
    // remove a particle from the array
    particles.splice(particles.length-1, 1);
  }
}

function getFPS() {
  // request animation frame tries to sync w/ monitor refresh rate
  // so fps should be close to monitor refresh rate


  let now = Date.now();
  if(now - startTime >= 1000) {
    // one second has passed
    startTime = null;
    fpsCounter.innerHTML = frames;
    frames = 0;
  } else {
    // if not at least a second later then add a frame
    frames++;
  }
  //console.log(now - startTime)
};

function start() {
  for(var i = 0; i < numParticles; i++) {
    createParticle();
  }
  
  // start the loop
  window.requestAnimationFrame(update);
};

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function findConnections(point) {
  for(var i = 0; i < particles.length; i++) {
    let distance = Math.hypot(point.x - particles[i].x, point.y - particles[i].y);
    if(distance < connectionDistance && particles[i] != point) {
      if(particles[i] === point) {
        console.log('testing')
      }
      drawLine(point, particles[i])
    }
  }
}

function drawLine(point1, point2) {
  // linear gradient from start to end of line
  var gradient = ctx.createLinearGradient(point1.x, point1.y, point2.x, point2.y);
  gradient.addColorStop(0, point1.color);
  gradient.addColorStop(1, point2.color);
  ctx.strokeStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(point1.x, point1.y);
  ctx.lineTo(point2.x, point2.y);
  ctx.stroke();
  ctx.closePath();
}

start();