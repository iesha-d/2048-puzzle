class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return "(" + this.x + ", " + this.y + ")";
    }

    translate(xShift, yShift) {
        return new Point(this.x + xShift, this.y + yShift);
    }

    scale(factor) {
        return new Point(this.x * factor, this.y * factor);
    }

    // In animation, we typically have a target Point that you are approaching
    // and we want to step toward that point every frame. 
}