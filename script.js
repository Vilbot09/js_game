const canvas = document.getElementById("game");
const context = canvas.getContext("2d");


const screenBorder = {xmin:0, xmax:canvas.width, ymin:0, ymax:canvas.height};

function worldMatrix(camera) {
    return [
        [ 1, 0 ],
        [ 0, 1 ],
        [ -camera.position.x + canvas.width/2, -camera.position.y + canvas.height/2]
    ];
}

function multiplyMatrix(position, matrix) {
    let newPos = {x: 0, y: 0};
    newPos.x = matrix[0][0] * position.x + matrix[1][0] * position.y + matrix[2][0];
    newPos.y = matrix[0][1] * position.x + matrix[1][1] * position.y + matrix[2][1];
    return newPos;
}

class Camera {
    constructor() {
        this.position = {x: 0, y: 200};
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

    physics() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        
        //complex collision logic should go here

        if (this.position.y + this.radius > 400 && this.velocity.y >= 0) {
            this.velocity.y *= -0.3;
        }
        if (this.position.y + this.radius < 400) {
            this.velocity.y += 1;
        }
       // else{this.velocity.y-=0.8;}
    }
}



const camera = new Camera();

const block = new Block(-250, 400, 500, 50, "black");
const golfBall = new GolfBall(10, "white");

const perfectFrameTime = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = Date.now();

function update() {
    deltaTime = (Date.now() - lastTimestamp);
    lastTimestamp = Date.now();

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#00aaff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    block.render(camera);
    golfBall.render(camera);

    golfBall.physics();
    requestAnimationFrame(update);
};
  
update();

document.addEventListener("keydown", (e) => {

});
document.addEventListener("keyup", (e) => {

});

