// global data
const particles = [];
const canvas = document.querySelector(".canvas");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const particleSpeed = 5;
const connectionDistance = 150;
const numParticles = 200;
const maxConnections = 7;
const frameInterval = 1;

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
        movePoint(particles[i]);
        drawPoint(particles[i]);
        findConnections(particles[i], i);
    }

    window.requestAnimationFrame(update);
};

function createParticle() {
    const x = Math.floor(Math.random() * canvas.width) + 1;
    const y = Math.floor(Math.random() * canvas.height) + 1;
    let velX = ((Math.floor(Math.random() * 10) + 2) / 50);
    let velY = ((Math.floor(Math.random() * 10) + 2) / 50);
    const xIsPositive = Math.random() >= 0.5;
    const yIsPositive = Math.random() >= 0.5;
    if (xIsPositive) velX = velX * -1;
    if (yIsPositive) velY = velY * -1;

    // set rand color
    const color = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
    // set rand size
    const radius = Math.floor(Math.random() * 3) + 1;

    const point = {
        x: x,
        y: y,
        velX: velX,
        velY: velY,
        color: color,
        radius: radius,
        inMouseRadius: false,
        numConnections: 0,
        moveOutOfRadiusDir: null,
    };

    particles.push(point);
};

function movePoint(point) {
    point.x += point.velX * particleSpeed;
    point.y += point.velY * particleSpeed;

    // check if new location will be inside canvas
    checkIfValidPosition(point);
};

function checkIfValidPosition(point) {
    // if new location is not valid, ie against or passed a border
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
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, 2*Math.PI, false);
    ctx.fillStyle = point.color;
    ctx.strokeStyle = point.color;
    ctx.fill();
    ctx.stroke();
};


function start() {
    for (let i = 0; i < numParticles; i++) {
        createParticle();
    }

    // start the loop
    window.requestAnimationFrame(update);
};

function get_dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function findConnections(point, index) {
    // find all connections for this point,
    // start at index, b/c everything below that has already been checked

    // reset num connections each frame
    point.numConnections = 0;

    for (let i = index + 1; i < particles.length; i++) {
        if (point.numConnections < maxConnections) {
            let distance = get_dist(point, particles[i]);
            if (distance < connectionDistance) {
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
    let percentOfMaxDist = (connectionDistance - distance) / connectionDistance;
    let intergerPercent = Math.floor((percentOfMaxDist * 255));

    let base16String = intergerPercent.toString(16);
    // if the hex value is a single chracter then add a zero before it
    // this is because the leading zeros are cut out
    if(base16String.length == 1) {
        base16String = '0' + base16String;
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