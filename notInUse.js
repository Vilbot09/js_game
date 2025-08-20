class ImageObject {
    constructor (x, y, image){
        this.x = x;
        this.y = y;
        this.image = image;
    }

    render() {
        context.drawImage(this.image, this.x, this.y, 40, 40);
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
            context.beginPath();
            context.rect(this.x, this.y, this.w, this.h);
            context.fillStyle = this.color;
            context.fill();
            context.closePath();
        }
        /*else if (this.shape === "circle") {
         context.beginPath();
         context.arc(this.x, this.y);
         context.fillStyle = this.color;
         context.fill();
         context.closePath();
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
 context.beginPath();
        context.moveTo(this.position.x, this.position.y)

        let penX = screenPosition.x;
        let penY = screenPosition.y;
        let angle =  Math.PI*(180-((180 * (this.edges - 2)) / this.edges))/180;
        for (let i = 0; i < this.edges + 1; i++) {
            penX += Math.cos(angle*i)*this.sidelength; 
            penY += Math.sin(angle*i)*this.sidelength;
            context.lineTo(penX, penY);
        }


        context.fillStyle = this.color;
        context.fill();


        drawLine({x: golfBall.position.x+golfBall.radius, y:golfBall.position.y-golfBall.radius }, {x:golfBall.position.x+golfBall.radius, y:golfBall.position.y+golfBall.radius })
    drawLine({x: golfBall.position.x-golfBall.radius, y:golfBall.position.y-golfBall.radius }, {x:golfBall.position.x-golfBall.radius, y:golfBall.position.y+golfBall.radius })


    function vertexSortingAlgorithm(polygon) {
    let rightVertices = [];
    let leftVertices = [];
    for (let i = 0; i < polygon.vertices.length; i++) {
        if (polygon.vertices[i].x > polygon.position.x) {
            rightVertices.push(polygon.vertices[i]);
        }
        if (polygon.vertices[i].x <= polygon.position.x) {
            leftVertices.push(polygon.vertices[i]);
        }
    }

    let sortedVertices = []
    let maximumVertex = {}
    let maxVertexValue = 0;

    for (let i = 0; i < rightVertices.length; i++) {
        for (let i = 0; i < rightVertices.length; i++) {
            if (projectVector({x: rightVertices[i].x - pol, y: 1}, {x: 0, y: 1})){}
        }


        rightVertices.splice(rightVertices.indexOf(maximumVertex))
        sortedVertices.push(maximumVertex)
    }
};