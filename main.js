// global data
let particles = [];
let canvas = document.querySelector(".canvas");
// set canvas to full window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext('2d');
let canvasHeight = canvas.height;
let canvasWidth = canvas.width;
let frames = 0;
let totalFrames = 0;
let particleSpeed = 5;
let oldParticleSpeed = null;
let startTime = null;
let endTime = null;
let connectionDistance = 225;
let oldConnectionDistance = null;
let numParticles = 75;
let oldNumParticles = null;
let draggingControlPanel = false;
let draggingOpacitySlider = false;
let mouseIsDown = 0;
let moveX = null;
let moveY = null;
let mousePos = null;
let mouseRadius = 200;
let maxConnections = numParticles;
let oldMaxConnections = null;
let frameInterval = 1;
let mouseOffset = null;
let mouseIsOverControlPanel = false;
let moveSpeedInRadius = 50;

// set element refs
let fpsCounter = document.querySelector(".fpsCounter");
let particleSpeedElem = document.querySelector(".particleSpeed");
let connectionDistanceElem = document.querySelector(".connectionDistance");
let numParticlesElem = document.querySelector(".numParticles");
let controlPanelElem = document.querySelector(".controlPanel");
let numParticlesInput = document.querySelector(".numParticlesInput");
let particleSpeedInput = document.querySelector(".particleSpeedInput");
let connectionDistanceInput = document.querySelector(".connectionDistanceInput");
let maxConnectionsInput = document.querySelector(".maxConnectionsInput");
let maxConnectionsElem = document.querySelector(".maxConnections");
let controlPanelOpacitySlider = document.querySelector(".controlPanelOpacitySlider");
let controlPanelOpacityContainer = document.querySelector(".controlPanelOpacityContainer");
let controlPanelOpacityLine = document.querySelector(".controlPanelOpacityLine");

// event listeners
document.querySelector(".header").addEventListener("click", moveControlPanel);
document.querySelector("body").addEventListener("mousemove", movedMouse);
document.querySelector("body").addEventListener("mouseup", mouseUp);
document.querySelector("body").addEventListener("mousedown", mouseDown);

//
// main update loop
// 

function update() {
  totalFrames++;

  if(startTime == null) {
    // if no start time create one
    startTime = Date.now();
  }

  // clear canvas of all previous particles
  // only clear every x frames
  if(totalFrames % frameInterval == 0){
    // every 2 frames
    clear();
  }

  for(var i = 0; i < particles.length; i++) {
    // run for each point
     
    let closeToMouse = checkDistToMouse(particles[i]);

    if(closeToMouse) {
      moveAwayFromMouse(particles[i]);
    } else {
      
    }

    movePoint(particles[i]);
    
    // begin point draw path
    // we set all the line positions and then draw at end for efficiency
    ctx.beginPath();
    drawPoint(particles[i]);
    // end path and draw the lines and fill
    ctx.fill();
    ctx.stroke();
    //ctx.closePath();

    // only draw connections every x frames
    // must keep this value in line w/ clear or else it will stutter
    if(totalFrames % frameInterval == 0){
      // every 2 frames
      findConnections(particles[i], i);
    }
  }

  updateUI();

  // update mouse radius view
  // only run if mouse has moved and its position has been set
  if(mousePos) {
    // dont display mouse radius arc if mouse is over control pannel of if dragging control pannel
    if(!mouseIsOverControlPanel && !draggingControlPanel) {
      updateMouseRadius();
    } 
  }

  getFPS();
  window.requestAnimationFrame(update);
};



function mouseUp() {
  --mouseIsDown;
  //console.log('mouse up')
  draggingControlPanel = false;
  draggingOpacitySlider = false;
};

function mouseDown(event) {
  if(event.target.classList[0] == 'headerLeft') {
    draggingControlPanel = true;
    let elemRect = controlPanelElem.getBoundingClientRect();
    // get offset based on where on element user clicked

    let mousePosOnDown = {x: event.clientX, y: event.clientY};
    let xOffset = Math.abs(mousePosOnDown.x - elemRect.x);
    let yOffset = Math.abs(mousePosOnDown.y - elemRect.y);
    mouseOffset = {x: xOffset, y: yOffset};
  } else if(event.target.classList[0] == 'controlPanelOpacitySlider') {
    draggingOpacitySlider = true;
  }
  ++mouseIsDown;
  //console.log('mouse down')
  
};

function movedMouse(event) {
  mousePos = {x: event.clientX, y: event.clientY};

  // check if over control panel
  // and if so then don't render mouse radius arc
  let elemRect = controlPanelElem.getBoundingClientRect();
  if(mousePos.x > elemRect.x && 
    mousePos.x < elemRect.x + elemRect.width &&
    mousePos.y > elemRect.y &&
    mousePos.y < elemRect.y + elemRect.height
  ) {
    // mouse is over the control panel
    mouseIsOverControlPanel = true;
  } else {
    // mouse is not over control panel
    mouseIsOverControlPanel = false;
  }

  // if dragging
  if(mouseIsDown == 1) {
    if(draggingControlPanel) {
      // is dragging control panel
      updateMoved();
    } else if(draggingOpacitySlider) {
      // is dragging opacity slider
      updateOpacitySlider();
    }
  }
};

function updateOpacitySlider() {
  // update control panel opacity
  // set opacity by getting percentage left the slider element is

  let elemRect = controlPanelOpacityLine.getBoundingClientRect();
  let sliderPos = Math.abs(elemRect.left - mousePos.x);
  let sliderOpacityPercent = sliderPos / elemRect.width;
  
  // only update slider if valid position and if mouse is over the opacity line element
  if(mousePos.x > elemRect.x && 
    mousePos.x < elemRect.x + elemRect.width &&
    mousePos.y > elemRect.y - 10 &&
    mousePos.y < elemRect.y + elemRect.height + 10
  ) {
    // mouse is over the control panel opacity container element
    controlPanelOpacitySlider.style.left = sliderPos + 'px';

    // set new opacity
    controlPanelElem.style.backgroundColor = 'rgba(51, 51, 51, ' + sliderOpacityPercent + ')';
  }
};

function updateMouseRadius() {
  // draw mouse radius
  ctx.beginPath();
  ctx.arc(mousePos.x, mousePos.y, mouseRadius, 0, 2*Math.PI);
  ctx.strokeStyle = "rgba(236, 238, 225, 0.1)";
  
  ctx.stroke();
  ctx.closePath();
  
};

function updateMoved() {
  console.log(mousePos.y)
  //controlPanelElem.style.transform = "translate(" + (mousePos.x + xOffset) + "px, " + (mousePos.y - yOffset) + "px)";
  let elemRect = controlPanelElem.getBoundingClientRect();
  controlPanelElem.style.left = mousePos.x - mouseOffset.x;
  controlPanelElem.style.top = mousePos.y - mouseOffset.y;
  
  //console.log(mousePos.y)
  //console.log(controlPanelElem.style.top)
  //console.log(elemRect)
};

function moveControlPanel() {
  //console.log('test')
  //draggingControlPanel = true;
};

function createParticle() {
  let x = Math.floor(Math.random() * canvasWidth) + 1;
  let y = Math.floor(Math.random() * canvasHeight) + 1;
  // velocity is between 1 and -1
  let velX = ((Math.floor(Math.random() * 10) + 2) / 50);
  let velY = ((Math.floor(Math.random() * 10) + 2) / 50);

  let xIsPositive = Math.random() >= 0.5;
  let yIsPositive = Math.random() >= 0.5;

  if(xIsPositive) {
    velX = velX * -1;
  }

  if(yIsPositive) {
    velY = velY * -1;
  }

  // set rand color
  let color = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
  // set rand size
  let radius = Math.floor(Math.random() * 3) + 1;

  let point = {
    x: x,
    y: y,
    velX: velX,
    velY: velY,
    color: color,
    radius: radius,
    inMouseRadius: false,
    numConnections: 0,
    moveOutOfRadiusDir: null,
  }
  
  particles.push(point);
};

function movePoint(point) {

  if(point.hitMouseBorder) {
    // if a point has just hit a border change its velocity
    moveAwayFromMouse(point);

    point.x += point.velX * particleSpeed;
    point.y += point.velY * particleSpeed;

    point.hitMouseBorder = false;
    point.inMouseRadius = false;
  } else if(point.inMouseRadius) {
    // if the point is inside the mouse radius then accelerate 
    // its movement speed to get it out of radius
    if(point.moveOutOfRadiusDir == 'left') {
      point.x -= moveSpeedInRadius;
    } else if(point.moveOutOfRadiusDir == 'right') {
      point.x += moveSpeedInRadius;
    } else if(point.moveOutOfRadiusDir == 'up') {
      point.y -= moveSpeedInRadius;
    } else if(point.moveOutOfRadiusDir == 'down') {
      point.y += moveSpeedInRadius;
    }
    
  } else {
    // if point is outside mouse radius move at normal speed
    point.x += point.velX * particleSpeed;
    point.y += point.velY * particleSpeed;
  }

  

  // check if new location will be inside canvas
  checkIfValidPosition(point)
};

function checkIfValidPosition(point) {``
  // if new location is not valid, ie against or pass a border
  // then revese the velocity of that axis
  // this gives the visual of it bouncing off the wall
  if(point.x - point.radius <= 0 || point.x + point.radius >= canvas.width) {
    point.velX = -point.velX;
  }

  if(point.y - point.radius <= 0 || point.y + point.radius >= canvas.height) {
    point.velY = -point.velY;
  }
};

function drawPoint(point) {
  
  ctx.arc(point.x, point.y, point.radius, 0, 2*Math.PI);
  ctx.fillStyle = point.color;
  ctx.strokeStyle = point.color;

};



function moveAwayFromMouse(particle) {
  // particle is too close to the mousePos
  // change particle direction to 'bounce' off mouse radius

  if(mousePos.x > particle.x) {
    // mouse is to right of particle, need to move particle left to move away from mouse

    // move left
    particle.moveOutOfRadiusDir = 'left';

    // if particle is close to mouse on its right side and its velocity is still moving it right
    // then flip its horizontal velocity
    if(particle.velX >= 0) {
      particle.velX = -particle.velX;
    }
  } else {
    // need to move right
    particle.moveOutOfRadiusDir = 'right';

    if(particle.velX <= 0) {
      particle.velX = -particle.velX;
    }
  }

  if(mousePos.y > particle.y) {
    // need to move up
    particle.moveOutOfRadiusDir = 'up';

    if(particle.velY >= 0) {
      particle.velY = -particle.velY;
    }
  } else {
    // need to move down
    particle.moveOutOfRadiusDir = 'down';

    if(particle.velY <= 0) {
      particle.velY = -particle.velY;
    }
  }

  // check if valid position

};

function checkDistToMouse(particle) {
  // check how far point is from mouse and if too close then move away from mouse
  if(mousePos) {
    let distance = Math.hypot(mousePos.x - particle.x, mousePos.y - particle.y);

    if(distance < mouseRadius + 5 && distance > mouseRadius) {
      particle.hitMouseBorder = true;
    }

    if(distance < mouseRadius) {
      particle.inMouseRadius = true;
      return true
    } else {
      particle.inMouseRadius = false;
      return false
    }
  } else {
    particle.inMouseRadius = false;
    return false
  }
};

function changedUI(event) {
  console.log('clicked button: ' + event.target.classList[0]);
  // responds to user clicks that change UI data

  //numParticlesInput
  //particleSpeedInput
  //connectionDistanceInput

  // number of particles
  if(event.target.classList[0] == 'increaseNumParticles') {
    console.log('increasing connection dist');

    let numChange = parseInt(numParticlesInput.value);
    numParticles = numParticles + numChange;
    for(let i = 0; i < numChange; i++) {
      changeNumberParticles('add');
    }
  } else if(event.target.classList[0] == 'decreaseNumParticles') {
    console.log('decreasing connection dist');

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
    console.log('increasing connection dist');
    let numChange = parseInt(connectionDistanceInput.value);
    connectionDistance = connectionDistance + numChange;
  } else if(event.target.classList[0] == 'decreaseConnectionDistance') {
    console.log('decreasing connection dist');
    let numChange = parseInt(connectionDistanceInput.value);
    connectionDistance = connectionDistance - numChange;
  } 

  // max connections
  if(event.target.classList[0] == 'increaseMaxConnections') {
    console.log('increasing max connections');
    let numChange = parseInt(maxConnectionsInput.value);
    maxConnections = maxConnections + numChange;
  } else if(event.target.classList[0] == 'decreaseMaxConnections') {
    console.log('decreasing max connections');

    // prevent negative 
    let numChange = parseInt(maxConnectionsInput.value);
    if(maxConnections - numChange >= 0) {
      maxConnections = maxConnections - numChange;
    }
  } 
};

function updateUI() {
  // runs in update, detects and changes to 
  // data that is in UI and updates

  // particle speed
  if(oldParticleSpeed != particleSpeed) {
    // if particle speed setting has changed
    particleSpeedElem.innerHTML = particleSpeed;
    oldParticleSpeed = particleSpeed;
    console.log('updating particle speed');
  }

  // connection distance
  if(oldConnectionDistance != connectionDistance) {
    // if particle speed setting has changed
    connectionDistanceElem.innerHTML = connectionDistance;
    oldConnectionDistance = connectionDistance;
    console.log('updating connection distance speed');
  }

  // number of particles
  if(oldNumParticles != numParticles) {
    // if particle speed setting has changed
    numParticlesElem.innerHTML = numParticles;
    oldNumParticles = numParticles;
    console.log('updating number of particles');
  }

  // max connections
  if(oldMaxConnections != maxConnections) {
    // if particle speed setting has changed
    maxConnectionsElem.innerHTML = maxConnections;
    oldMaxConnections = maxConnections;
    console.log('updating number of max connections');
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
};

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
};

function findConnections(point, index) {
  // pass the i / index from calling function
  // then set this counter to start at that point
  // this will cause current point to only check points larger than it
  // which reduces unnessesary checks b/c lower points
  // have already been checked against this point

  // reset num connections each frame
  point.numConnections = 0;

  for(let i = index; i < particles.length; i++) {
    if(particles[i] != point) {
      let distance = Math.hypot(point.x - particles[i].x, point.y - particles[i].y);
      if(distance < connectionDistance && point.numConnections < maxConnections) {
        drawLine(point, particles[i], distance);
        point.numConnections = point.numConnections + 1;
      }
    }
  }
};

function drawLine(point1, point2, distance) {

  // set the line transparency on its length

  // get the percentage of max distance that the line was
  // convert to int and round
  // convert to base 16 string ( which is what hex color values use for alpha )
  let percentOfMaxDist = (connectionDistance - distance) / 250;
  let intergerPercent = Math.floor((percentOfMaxDist * 255));
  
  let base16String = intergerPercent.toString(16);
  // if the hex value is a single chracter then add a zero before it
  // this is because the leading zeros are cut out
  if(base16String.length == 1) {
    base16String = '0' + base16String;
  }

  if(totalFrames % 100 == 0){
    
  }

  // linear gradient from start to end of line
  var gradient = ctx.createLinearGradient(point1.x, point1.y, point2.x, point2.y);
  gradient.addColorStop(0, point1.color + base16String);
  gradient.addColorStop(1, point2.color + base16String);
  ctx.strokeStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(point1.x, point1.y);
  ctx.lineTo(point2.x, point2.y);
  ctx.stroke();
  ctx.closePath();
};

start();