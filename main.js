// global data
let points = [];
let canvas = document.querySelector(".canvas");
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

// set element refs
let fpsCounter = document.querySelector(".fpsCounter");
let particleSpeedElem = document.querySelector(".particleSpeed");
let connectionDistanceElem = document.querySelector(".connectionDistance");

function createPoints() {
  let numPoints = 20;
  for(let i = 0; i < numPoints; i++) {
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
    points.push(point);
  }
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

  // clear canvas of all previous points
  clear();
  for(var i = 0; i < points.length; i++) {
    // run for each point
    movePoint(points[i]);
    drawPoint(points[i]);
    findConnections(points[i]);
    updateUI();
  }
  getFPS();
  window.requestAnimationFrame(update);
};

function changedUI(event) {
  // responds to user clicks that change UI data

  if(event.target.classList[0] == 'increaseParticleSpeed') {
    console.log('increasing speed')
    particleSpeed++;
  } else if(event.target.classList[0] == 'decreaseParticleSpeed') {
    console.log('decreasing speed')
    particleSpeed--;
  } 

  if(event.target.classList[0] == 'increaseConnectionDistance') {
    console.log('increasing connection dist')
    connectionDistance = connectionDistance + 10;
  } else if(event.target.classList[0] == 'decreaseConnectionDistance') {
    console.log('decreasing connection dist')
    connectionDistance = connectionDistance - 10;
  } 

}

function updateUI() {
  // runs in update, detects and changes to 
  // data that is in UI and updates
  if(oldParticleSpeed != particleSpeed) {
    // if particle speed setting has changed
    particleSpeedElem.innerHTML = particleSpeed;
    oldParticleSpeed = particleSpeed;
    console.log('updating particle speed')
  }

  if(oldConnectionDistance != connectionDistance) {
    // if particle speed setting has changed
    connectionDistanceElem.innerHTML = connectionDistance;
    oldConnectionDistance = connectionDistance;
    console.log('updating connection distance speed')
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
  createPoints();
  // start the loop
  window.requestAnimationFrame(update);
};

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function findConnections(point) {
  for(var i = 0; i < points.length; i++) {
    let distance = Math.hypot(point.x - points[i].x, point.y - points[i].y);
    if(distance < connectionDistance && points[i] != point) {
      if(points[i] === point) {
        console.log('testing')
      }
      drawLine(point, points[i])
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