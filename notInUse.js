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