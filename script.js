const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


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
        this.position = {x: 0, y: 400};
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

class GolfBall extends WorldObject {
    constructor(color) {
        super();
        this.color = color;
        this.radius = 30;
        this.velocity = {x: 0, y: 0}
    }

    render(camera) {
        // Vi kommer inte att använda world position, en matrix kommer översätta global position till lokal position, (position på skärmen)
        
        let screenPosition = multiplyMatrix(this.position, worldMatrix(camera));

        // Drawing
        ctx.beginPath();
        ctx.arc(screenPosition.x, screenPosition.y, this.radius, 0, 2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    physics() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        
        //complex collision logic should go here

        if (this.position.y + this.radius > screenBorder.ymax && this.velocity.y >= 0) {
            this.velocity.y *= -0.3;
        }
        if (this.position.y + this.radius < screenBorder.ymax) {
            this.velocity.y += 1;
        }
       // else{this.velocity.y-=0.8;}
    }
}

class ImageObject {
    constructor (x, y, image){
        this.x = x;
        this.y = y;
        this.image = image;
    }

    render() {
        ctx.drawImage(this.image, this.x, this.y, 40, 40);
    } 
};

class CanvasObject {
    constructor(x, y, w, h, color, shape) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.shape = shape;
    }   

    render() {
        if (this.shape === "rectangle") {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
        /*else if (this.shape === "circle") {
            ctx.beginPath();
            ctx.arc(this.x, this.y);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }*/
    }
};

/*this only compares two objects, would probably be extremely inefficient 
to use something like this for the entire collision system*/
function areOverlapping(obj1, obj2) {
    if ((obj1.x < obj2.x + obj2.w && obj1.x + obj1.w > obj2.x) && (obj1.y < obj2.y + obj2.h && obj1.y + obj1.h > obj2.h)){
        return true;
    }

    else{
        return false;
    }
}

const camera = new Camera();
const golfBall = new GolfBall("red");

const perfectFrameTime = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = Date.now();

function update() {
    deltaTime = (Date.now() - lastTimestamp) / perfectFrameTime;
    lastTimestamp = Date.now();

    ctx.clearRect(0, 0, 1200, 600);

    golfBall.render(camera);
    golfBall.physics();
    requestAnimationFrame(update);
};
  
update();

document.addEventListener("keydown", (e) => {

});
document.addEventListener("keyup", (e) => {

});

