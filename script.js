const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

const screenBorder = {xmin:-0.5*canvas.width, xmax:0.5*canvas.width, ymin:-0.5*canvas.height, ymax:0.5*canvas.height};

let drawingVertices = [];
const worldObjects = [];
const blockArray = [];
let drawingMode = false;

let mousePosition = {x:0, y: 0};

//Physics related constants and variables
const gameSpeed = 1;
const gravityConstant = 1;
const elasticity = 0.4;
const minimumBounce = 0.2;
const friction = 1;
const airResistance = 0;
const wind = 0;
/*
function getMousePos(evt) {
  var rect = canvas.getBoundingClientRect();
  console.log({
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  })
  return {
    clientX: evt.clientX - rect.left,
    clientY: evt.clientY - rect.top
  };
}*/

canvas.onmousedown = function(e) {
    let event = getMousePos(e);
    if (drawingMode === true) {
        drawingVertices.push({x: event.clientX, y: event.clientY});
    }

    else {
        golfBall.position.x = event.clientX;
        golfBall.position.y = event.clientY;
        golfBall.velocity = {x:0, y:0}

        golfBall.position = multiplyMatrix(golfBall.position, inverseWorldMatrix(camera))
    }
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
    constructor(vertices, color) {
        super();
        this.vertices = vertices;
        
        this.color = color;
        this.edgeNormals = [];
        for(let i = 0; i < this.vertices.length-1; i++) {
            this.edgeNormals.push(calculateEdgeNormal(this.vertices[i], this.vertices[i+1]))
        }
        this.edgeNormals.push(calculateEdgeNormal(this.vertices[this.vertices.length-1], this.vertices[0]));
        
    }

    render(camera) {
        const screenPosition = multiplyMatrix(this.vertices[this.vertices.length-1], worldMatrix(camera));
        
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
        this.velocity = {x: 0, y: 0};
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

class GolfClub extends WorldObject {
    constructor() {
        super();
        this.type = "7i";
        
        this.image = new Image();
        this.image.src = "./images/7i.png";
        this.rotation = 0;
    }

    render(camera) {
        const pos = multiplyMatrix(this.position, worldMatrix(camera));

        let angle = Math.atan2(mousePosition.y-pos.y, mousePosition.x-pos.x);
        this.rotation = angle;
        context.save();
        context.translate( pos.x, pos.y );
        context.rotate( this.rotation + 1.525*Math.PI);
        //context.translate( -objectRotationCenterX, -objectRotationCenterY );
        context.drawImage(this.image, 0, 0, 200 * this.image.width/this.image.height, 200);
        context.restore();
    }
}

class HoleAndFlag {
    constructor(position) {
        this.position = position;
        this.flagImage = new Image();
        this.flagImage.src = "./images/flag.png";
    }

    render() {
        const pos = multiplyMatrix(this.position, worldMatrix(camera));

        context.fillStyle = "black";
        context.fillRect(pos.x, pos.y, 30, 30);

        context.drawImage(this.flagImage, pos.x, pos.y-200, 200 * this.flagImage.width/this.flagImage.height, 200);
    }
}

const getMousePos = (evt) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: ((evt.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
        y: ((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
    };
};

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

//Projects vector 1 onto vector 2
function projectVector(vec1, vec2) {
    let dot = vec1.x * vec2.x + vec1.y * vec2.y;
    let magnitude = Math.sqrt(vec2.x ** 2 + vec2.y ** 2);
    return dot / magnitude;

}

function sortVerticesClockwise(inputVertices) {
    let vertices = inputVertices;
    const center = {
        x: vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length,
        y: vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length
    };

    
    vertices = vertices.slice().sort((a, b) => {
        const angleA = Math.atan2(b.y - center.y, b.x - center.x);
        const angleB = Math.atan2(a.y - center.y, a.x - center.x);
        return angleB - angleA;
    });
    return vertices;

}


const golfBall = new GolfBall(10, "white");
const camera = new Camera();
const hole = new HoleAndFlag({x: 300, y: 0 });

const club = new GolfClub();
club.position.y = 0;
//you only need to specify position, sidelength and number of edges

//You have to manually add all of the points, you need to add them clockwise, else collision breaks



// Grass
blockArray.push(new RegularPolygon(200, -200, 400, 4, "green"))
blockArray.push(new RegularPolygon(550, -50, 200, 3, "green"))

//blockArray.push(new RegularPolygon(80, 2, 50, 5, "red"));
//blockArray.push(new IrregularPolygon([{x:100, y:-200}, {x:-400, y:-200}, {x: -100, y:0}], "blue"))
//blockArray.push(new IrregularPolygon([{x:-100, y:-100}, {x: -600, y:-100}, {x:-300, y:100}], "blue"))

// Stones
blockArray.push(new RegularPolygon(200, -200, 400, 4, "green"))
blockArray.push(new IrregularPolygon([{x:-300, y:400}, {x:-600,y:0}, {x:-600, y: 300}], "gray"))
blockArray.push(new IrregularPolygon([{x:-600, y:0}, {x:0,y:-300}, {x:-600, y: -300}], "gray"))


//Hold down q to activate drawing mode, the places you click before you let go will become vertices in a new polygon
function drawIrregularPolygon(vertices) {
    let screenVertices = sortVerticesClockwise(vertices);
    console.log(vertices)

    let objectiveVertices = []
    for (let i = 0; i < screenVertices.length; i++){
        objectiveVertices.push(multiplyMatrix(screenVertices[i], inverseWorldMatrix(camera)))
    }
    drawingVertices = []
    blockArray.push(new IrregularPolygon(objectiveVertices, "black"));
}

const perfectFrameTime = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = Date.now();

function update() {
    deltaTime = (Date.now() - lastTimestamp);
    deltaTime /= perfectFrameTime; 
    lastTimestamp = Date.now();

    // camera.position.x += 0.2;
    club.rotation += -0.01;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#00aaff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < blockArray.length; i++) {
        blockArray[i].render(camera);
    }

    hole.render();
    golfBall.render(camera);
    club.render(camera);

    golfBall.physics(deltaTime);
    requestAnimationFrame(update);
};
  
update();

document.addEventListener('mousemove', (e) => {
    mousePosition = getMousePos(e);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "q"){
        drawingMode = true;
        
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "q"){
        drawingMode = false;
        if (drawingVertices.length >= 3) {
            drawIrregularPolygon(drawingVertices);
        }
        drawingVertices = []
    }
});

