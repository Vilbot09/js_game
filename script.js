const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

const screenBorder = {xmin:-0.5*canvas.width, xmax:0.5*canvas.width, ymin:-0.5*canvas.height, ymax:0.5*canvas.height};

const worldObjects = [];
const blockArray = [];

//Physics related constants and variables
const gameSpeed = 1;
const gravityConstant = 1;
const elasticity = 0.4;
const minimumBounce = 0.2;
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
        this.position = {x: -100, y: 100};
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
         this.edgeNormals.push(calculateEdgeNormal(this.vertices[this.vertices.length-1], this.vertices[0]))

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
        //this.drawVertices();
        
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
         this.edgeNormals.push(calculateEdgeNormal(this.vertices[this.vertices.length-1], this.vertices[0]));
        
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
        //this.drawVertices();
        
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

        let resolutionAxis = this.collision();
        if (resolutionAxis) {
            this.position.x += 1 * resolutionAxis.x;
            this.position.y += 1 * resolutionAxis.y;

            let normal = {x: resolutionAxis.x / Math.sqrt(resolutionAxis.x ** 2 + resolutionAxis.y ** 2), y: resolutionAxis.y / Math.sqrt(resolutionAxis.x ** 2 + resolutionAxis.y ** 2)}
            const dot = this.velocity.x * normal.x + this.velocity.y * normal.y;
            const reflectedX = this.velocity.x - (1 + elasticity) * dot * normal.x;
            const reflectedY = this.velocity.y - (1 + elasticity) * dot * normal.y;

            this.velocity.x = reflectedX;
            this.velocity.y = reflectedY;

            
        }
    }
    collision() {
        let pos = this.position;

        //for every object you are checking with
        for (let i = 0; i < blockArray.length; i++) {
            let polygon = blockArray[i];
            
            let axes = [...polygon.edgeNormals];
            
            
            let distance = Infinity;
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
            //Now we have all the axes, the ones the polygon already knows,  
            //as well as the one between the circle center and nearest polygon vertex

            //so we can break out of the checking loop in certain cases
            let collision = true;
            let overlap = Infinity;
            let minimumTranslationVector = {x: 0, y: 0}

            //check for every axis
            for (let i = 0; i < axes.length; i++) {
                let axis = axes[i];

                //Project the polygon, and then the circle onto a line, and compare there min and max values
                //to check for a separating axis, if we cant find any, the objects are colliding
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

                if (maxPoly <= minCircle || maxCircle <= minPoly) {
                    collision = false;
                    break;
                }
                else {
                    let newOverlap = 0;
                    if (minCircle < minPoly) {
                        newOverlap = Math.abs(maxCircle - minPoly);
                    }
                    if (maxCircle > maxPoly) {
                        newOverlap = Math.abs(minCircle - maxPoly);
                    }
                    else {
                        newOverlap = Math.min(Math.abs(maxCircle - minCircle), Math.abs(maxPoly - minPoly));
                    }
                    if (newOverlap < overlap){
                        overlap = newOverlap;

                        minimumTranslationVector = {x: axis.x*overlap, y: axis.y*overlap};
                    }
                }

            }
            if (collision && overlap > 0.0001) {
              return minimumTranslationVector;            
            }

        }
    }
}

function drawLine(point1, point2) {
    let deltaX = point2.x - point1.x;
    let deltaY = point2.y - point1.y;
    if (deltaX === 0) {
        deltaX = 0.01;
    }
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
    return {x: -deltaY / distance, y: deltaX / distance};

}


function vertexSortingAlgorithm() {

};

const golfBall = new GolfBall(10, "white");
const camera = new Camera();

//you only need to specify position, sidelength and number of edges
const polygon = new RegularPolygon(150, 150, 50, 4, "green");

//You have to manually add all of the points, you need to add them clockwise, else collision breaks
const irregularPolygon = new IrregularPolygon(-100, 0, [{x:100, y:-200}, {x:-400, y:-200}, {x: -100, y:0}], "blue")

blockArray.push(polygon)
blockArray.push(irregularPolygon)
blockArray.push(new RegularPolygon(80, 2, 50, 5, "red"));



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
    for (let i = 0; i < blockArray.length; i++) {
        blockArray[i].render(camera);
    }
    golfBall.render(camera);

    golfBall.physics(deltaTime);
    requestAnimationFrame(update);
};
  
update();

document.addEventListener("keydown", (e) => {

});
document.addEventListener("keyup", (e) => {

});

