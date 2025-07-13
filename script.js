const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

const screenBorder = {xmin:-0.5*canvas.width, xmax:0.5*canvas.width, ymin:-0.5*canvas.height, ymax:0.5*canvas.height};

const worldObjects = [];
const blockArray = [];

//Physics related constants and variables
const gameSpeed = 1;
const gravityConstant = 1;
const elasticity = 0.4;
const minimumBounce = 3;
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
    newPos.x = matrix[0][0] * position.x + matrix[0][1] * position.y + matrix[2][0];
    newPos.y = matrix[1][0] * position.x + matrix[1][1] * position.y + matrix[2][1];
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
    constructor(x, y, w, h, color, type) {
        super();
        this.position = {x: x, y: y};
        this.width = w;
        this.height = h;
        this.color = color;
        this.type = type
    }

    render(camera) {
        const screenPosition = multiplyMatrix(this.position, worldMatrix(camera));
            
            context.beginPath();
            context.rect(screenPosition.x, screenPosition.y, this.width, this.height);
            context.fillStyle = this.color;
            context.fill();
            context.closePath();
        
    }
    //this is how to rotate a rectangle
    rotate(screenPosition, rotation) {
        context.save();
        context.translate(screenPosition.x + this.width/2, screenPosition.y+this.height/2);
        context.rotate(rotation);
        context.fillStyle = this.color;
        context.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        context.restore(); 
    }
}

class RegularPolygon extends WorldObject{
    constructor(x, y, sidelength, edges, color) {
        super();
        this.position = {x: x, y: y};
        this.sidelength = sidelength;
        this.color = color;
        this.edges = edges;
        this.vertices = [];
        this.cameraVertices = [];
        this.edgeNormals = [];

        const screenPosition = multiplyMatrix(this.position, worldMatrix(camera));
        let penX = screenPosition.x;
        let penY = screenPosition.y;
        let angle =  Math.PI*(180-((180 * (this.edges - 2)) / this.edges))/180;
        for (let i = 1; i < this.edges + 1; i++) {
            penX += Math.cos(angle*i)*this.sidelength; 
            penY += Math.sin(angle*i)*this.sidelength;
            this.cameraVertices.push({x:penX, y:penY});
            this.vertices.push(multiplyMatrix({x:penX, y:penY}, inverseWorldMatrix(camera)));
        }
        
        for(let i = 0; i < this.vertices.length-1; i++) {
            this.edgeNormals.push(calculateEdgeNormal(this.vertices[i], this.vertices[i+1]))
        }
         this.edgeNormals.push(calculateEdgeNormal(this.vertices[0], this.vertices[this.vertices.length-1]))

    }

    render(camera) {
        const screenPosition = multiplyMatrix(this.position, worldMatrix(camera));
        
        context.beginPath();
        context.moveTo(screenPosition.x, screenPosition.y)

        for (let i = 0; i < this.cameraVertices.length; i++) {
            context.lineTo(this.cameraVertices[i].x, this.cameraVertices[i].y);
        } 

        context.fillStyle = this.color;
        context.fill();
        this.drawVertices();
        
    }
    drawVertices() {
        

        for (let i = 0; i < this.vertices.length-1; i++) {
            drawLine(this.vertices[i], this.vertices[i+1]);
        }
        drawLine(this.vertices[0], this.vertices[this.vertices.length-1])


    }

    //this is how to rotate a rectangle
    rotate(screenPosition, rotation) {
        context.save();
        context.translate(screenPosition.x + this.width/2, screenPosition.y+this.height/2);
        context.rotate(rotation);
        context.fillStyle = this.color;
        context.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        context.restore(); 
    }
}

class IrregularPolygon extends WorldObject{
    constructor(x, y, vertices, color) {
        super();
        this.position = {x: x, y: y};
        this.vertices = vertices;
        this.color = color;
        this.edgeNormals = [];
        for(let i = 0; i < this.vertices.length-1; i++) {
            this.edgeNormals.push(calculateEdgeNormal(this.vertices[i], this.vertices[i+1]))
        }
         this.edgeNormals.push(calculateEdgeNormal(this.vertices[0], this.vertices[this.vertices.length-1]))
        
    }

    render(camera) {
        const screenPosition = multiplyMatrix(this.position, worldMatrix(camera));
        
        context.beginPath();
        context.moveTo(screenPosition.x, screenPosition.y)

        let vertex = {}
        for (let i = 0; i < this.vertices.length; i++) {
            vertex = multiplyMatrix(this.vertices[i], worldMatrix(camera));
            context.lineTo(vertex.x, vertex.y);
        } 
       
        context.fillStyle = this.color;
        context.fill();
        this.drawVertices();
        
    }

    drawVertices() {
        for (let i = 0; i < this.vertices.length-1; i++) {
            drawLine(this.vertices[i], this.vertices[i+1]);
        }
        drawLine(this.vertices[0], this.vertices[this.vertices.length-1])
    }
    //this is how to rotate a rectangle
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
        this.velocity.y -= gravityConstant * delta * gameSpeed;

        this.collision(delta);

    }
    
    collision(delta) {
        let pos = this.position;


        for (let i = 0; i < blockArray.length; i++) {
            let polygon = blockArray[i];
            
            let axes = [...polygon.edgeNormals];
            
            
            let distance = 1000000;
            let closestVertex = {}
            for (let i = 0; i < polygon.vertices.length; i++) {
                let deltaX = pos.x - polygon.vertices[i].x;
                let deltaY = pos.y - polygon.vertices[i].y;
                
                if (distance > Math.sqrt(deltaX ** 2 + deltaY ** 2)) {
                    distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
                    closestVertex = polygon.vertices[i];
                }
            }

            axes.push(calculateEdgeNormal(this.position, closestVertex));

            let collision = true;
            for (let i = 0; i < axes.length; i++) {
                let axis = axes[i];

                let minPoly = Infinity;
                let maxPoly = -Infinity;
                for (let j = 0; j < polygon.vertices.length; j++) {
                    let vertex = polygon.vertices[j];
                    let dot = vertex.x * axis.x + vertex.y * axis.y;
                    minPoly = Math.min(minPoly, dot);
                    maxPoly = Math.max(maxPoly, dot);
                }

                let centerDot = pos.x * axis.x + pos.y * axis.y;
                let minCircle = centerDot - this.radius;
                let maxCircle = centerDot + this.radius;

                if (maxPoly < minCircle || maxCircle < minPoly) {
                    collision = false;
                    break;
                }

            }
            if (collision) {
               this.velocity.y = 0;
            }

        }
    }
}

function drawLine(point1, point2) {
    let deltaX = point2.x - point1.x;
    let deltaY = point2.y - point1.y;
    let k = deltaY/deltaX;
    let m = point1.y - point1.x*k
    let firstPoint = {x: -1000, y:-1000*k+m}
    let secondPoint = {x: 1000, y:1000*k+m}
    firstPoint = multiplyMatrix(firstPoint, worldMatrix(camera))
    secondPoint = multiplyMatrix(secondPoint, worldMatrix(camera))

    
    context.beginPath();
    context.moveTo(firstPoint.x, firstPoint.y);
    context.lineTo(secondPoint.x, secondPoint.y);
    context.strokeStyle = "red";
    context.stroke();
    context.closePath();
}



function calculateEdgeNormal(point1, point2) {
    let deltaX = point2.x - point1.x;
    let deltaY = point2.y - point1.y;
    let distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    return {x: deltaY / distance, y: -deltaX / distance};

}


const camera = new Camera();

const block = new Block(-250, -250, 500, 50, "black");

const polygon = new RegularPolygon(150, 150, 50, 5, "green");

const irregularPolygon = new IrregularPolygon(0, 0, [{x:-50, y:0}, {x:-75, y:-200}, {x: 0, y:0}], "blue")

blockArray.push(polygon)
blockArray.push(irregularPolygon)
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
    polygon.render(camera);
    irregularPolygon.render(camera);
    golfBall.render(camera);

    golfBall.physics(deltaTime);
    requestAnimationFrame(update);
};
  
update();

document.addEventListener("keydown", (e) => {

});
document.addEventListener("keyup", (e) => {

});

