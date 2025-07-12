const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

const screenBorder = {xmin:-0.5*canvas.width, xmax:0.5*canvas.width, ymin:-0.5*canvas.height, ymax:0.5*canvas.height};

const worldObjects = [];
const blockArray = [];

//Physics related constants and variables
const gameSpeed = 1;
const gravityConstant = 1;
const elasticity = 0.4;
const minimumBounce = 5;
const friction = 1;
const airResistance = 0;
const wind = 0;

//This is useful for debugging, clicking on the canvas places the ball at the position of the mouse
canvas.onmousedown = function(event) {


    golfBall.position.x = event.clientX;
    golfBall.position.y = event.clientY;
    golfBall.velocity = {x:0, y:0}

    golfBall.position = multiplyMatrix(golfBall.position, inverseWorldMatrix(camera))
    golfBall.position.x -= 75;
   //golfBall.position = multiplyMatrix2x2(golfBall.position, [[0, 1], [-1, 0]]), would place the ball 90 degrees rotated 
   //around the middle of the canvas (0, 0)

}

function worldMatrix(camera) {
    return [
        [ 1, 0 ],
        [ 0, -1 ],
        [ -camera.position.x + canvas.width/2, -camera.position.y + canvas.height/2]
    ];
}

function multiplyMatrix(position, matrix) {
    let newPos = {x: 0, y: 0};
    newPos.x = matrix[0][0] * position.x + matrix[1][0] * position.y + matrix[2][0];
    newPos.y = matrix[0][1] * position.x + matrix[1][1] * position.y + matrix[2][1];
    return newPos;
}

function multiplyMatrix2x2(vector, matrix) {
    let newVector = {x: 0, y: 0};
    newVector.x = matrix[0][0]*vector.x + matrix[1][0]*vector.y;
    newVector.y = matrix[0][1]*vector.x + matrix[1][1]*vector.y;
    return newVector;

}

//returns an inversed matrix of the worldMatrix
function inverseWorldMatrix(camera) {
    return [
        [1, 0],
        [0, -1],
        [
            -camera.position.x - canvas.width / 2,
            -(camera.position.y - canvas.height / 2)
        ]
    ];
}


class Camera {
    constructor() {
        this.position = {x: 0, y: 0};
        this.zoom = 100;
    }
}

class Level {
    constructor() {
        
    }
}

class WorldObject {
    constructor() {
        this.position = {x: 0, y: 0};
    }
}

class Block extends WorldObject{
    constructor(x, y, w, h, color) {
        super();
        this.position = {x: x, y: y};
        this.width = w;
        this.height = h;
        this.color = color;
    }

    render(camera) {
        const screenPosition = multiplyMatrix(this.position, worldMatrix(camera));
        context.beginPath();
        context.rect(screenPosition.x, screenPosition.y, this.width, this.height);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
        
    }
    //this is how to rotate an object
    rotate(screenPosition, rotation) {
        context.save();
        context.translate(screenPosition.x + this.width/2, screenPosition.y+this.height/2);
        context.rotate(rotation);
        context.fillStyle = this.color;
        context.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        context.restore(); 
    }
}

class GolfBall extends WorldObject {
    constructor(radius, color) {
        super();
        this.color = color;
        this.radius = radius;
        this.velocity = {x: 0, y: 0}
    }

    render(camera) {
        // Vi kommer inte att använda world position, en matrix kommer översätta global position till lokal position, (position på skärmen)
        
        const screenPosition = multiplyMatrix(this.position, worldMatrix(camera));

        // Drawing
        context.beginPath();
        context.arc(screenPosition.x, screenPosition.y, this.radius, 0, 2*Math.PI);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
    }

    physics(delta) {
        this.position.x += this.velocity.x * delta * gameSpeed;
        this.position.y += this.velocity.y * delta * gameSpeed;
        this.velocity.y -= gravityConstant*delta*gameSpeed;

        this.collision(delta);

    }
    
    collision(delta) {
        let posX = this.position.x;
        let posY = this.position.y;
        let velX = this.velocity.x;
        let velY = this.velocity.y;
        let r = this.radius

        for (let i = 0; i < blockArray.length; i++) {
            let boxX = blockArray[i].position.x;
            let boxY = blockArray[i].position.y;
            let boxW = blockArray[i].width;
            let boxH = blockArray[i].height;

            if ((posY+r >= boxY-boxH && posY-r <= boxY) && (posX+r >= boxX && posX-r <= boxX+boxW)) {
                this.position.y -= this.velocity.y*delta*gameSpeed;
                this.velocity.y *= -elasticity; 

                if (Math.abs(velY) < minimumBounce) {
                    this.velocity.y = 0;
                    this.position.y = boxY + this.radius;
                }
            }

        }
    }
}



const camera = new Camera();

const block = new Block(-250, -250, 500, 50, "black");
blockArray.push(block)
const golfBall = new GolfBall(10, "white");

const perfectFrameTime = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = Date.now();

function update() {
    deltaTime = (Date.now() - lastTimestamp);
    deltaTime /= perfectFrameTime; 
    lastTimestamp = Date.now();

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#00aaff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    block.render(camera);
    golfBall.render(camera);

    golfBall.physics(deltaTime);
    requestAnimationFrame(update);
};
  
update();
console.log(inverseWorldMatrix(camera));

document.addEventListener("keydown", (e) => {

});
document.addEventListener("keyup", (e) => {

});

