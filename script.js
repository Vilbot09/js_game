const game = document.getElementById("game");
const ctx = game.getContext("2d");

const sun_image = new Image();
sun_image.src = "images/sun.png";

const Canvas_Objects = [];
const Image_Objects = [];
const Static_Scene_Objects = [];
const Moving_Scene_Objects = [];

const screen_border = {xmin:0, xmax:game.width, ymin:0, ymax:game.height};

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

let right_pressed = false;
let left_pressed = false;
let up_pressed = false;
let down_pressed = false;

function keyDownHandler(e) {
    if (e.code == "ArrowRight" || e.code == "Right") {
        right_pressed = true;
    }
    if (e.code == "ArrowLeft" || e.code == "Left") {
        left_pressed = true;
    }
    if (e.code == "ArrowUp" || e.code == "Up") {
        up_pressed = true;
    }
    if (e.code == "ArrowDown" || e.code == "Down") {
        down_pressed = true;
    }
};

function keyUpHandler(e) {
    if (e.code == "ArrowRight" || e.code == "Right") {
        right_pressed = false;
    }
    if (e.code == "ArrowLeft" || e.code == "Left") {
        left_pressed = false;
    }
    if (e.code == "ArrowUp" || e.code == "Up") {
        up_pressed = false;
    }
    if (e.code == "ArrowDown" || e.code == "Down") {
        down_pressed = false;
    }
};

class Background {

};

class Image_Object {
    constructor (x, y, image){
        this.x = x;
        this.y = y;
        this.image = image;
    }

    render() {
        ctx.drawImage(this.image, this.x, this.y, 40, 40);
    } 
};

class Canvas_Object {
    constructor(x, y, w, h, color, shape) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.shape = shape;
    }   

    render() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
};

class Static_Scene_Image_Object {

};

class Static_Scene_Canvas_Object extends Canvas_Object {

};

class Moving_Scene_Object {
    
};

class Player_Object {
    constructor(x, y, w, h, color, shape) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.shape = shape;
        this.speed = 20
    }   

    show() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
};

class Collision_node {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.w = 100;
        this.h = 100;
    };

    update_contents() {

    };
};

function render_background_objects() {
    for (let i = 0; i < Canvas_Objects.length; i++) {
        Canvas_Objects[i].render();

    };

    for (let i = 0; i < Image_Objects.length; i++) {
        Image_Objects[i].render();
    };
};

/*this only compares two objects, would probably be extremely inefficient 
to use something like this for the entire collision system*/
function are_overlapping(obj1, obj2) {
    if ((obj1.x < obj2.x + obj2.w && obj1.x + obj1.w > obj2.x) && (obj1.y < obj2.y + obj2.h && obj1.y + obj1.h > obj2.h)){
        return true;
    }

    else{
        return false;
    }
}

function player_input() {
    if (right_pressed) {
        player.x += player.speed*deltaTime;
    }

    if (left_pressed) {
        player.x -= player.speed*deltaTime;
    }

    if (up_pressed) {
        player.y -= player.speed*deltaTime;
    }

    if (down_pressed) {
        player.y += player.speed*deltaTime;
    }
};

function input_handler() {
    player_input();
};

function physics_engine() {

};

Canvas_Objects.push(new Canvas_Object(50, 50, 100, 100, "blue", "square"));

sun_image.onload = function () {
    Image_Objects.push(new Image_Object(100, 100, sun_image));
};
const player = new Player_Object(20, 20, 100, 100, "red", "square");



const perfectFrameTime = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = Date.now();

function gameLoop() {
    deltaTime = (Date.now() - lastTimestamp) / perfectFrameTime;
    lastTimestamp = Date.now();

    ctx.clearRect(0, 0, 1200, 600);;
    render_background_objects();
    player.show();

    input_handler();
    physics_engine();

    requestAnimationFrame(gameLoop);
};
  
  
gameLoop();
