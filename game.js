'use strict';

class Vector {
    constructor(x=0,y=0) {
        this.x=x;
        this.y=y;
    }
    plus(vector) {
        //todo exeption
        if (vector instanceof Vector) {
            let newX= this.x + vector.x;
            let newY= this.y + vector.y;
            return new Vector(newX,newY);
        } else {
            let e = new Error(`Это не вектор`);
            throw(e);
        }
}
    times(multiplier) {
        //todo exeption
        let newX= this.x *multiplier;
        let newY= this.y *multiplier;
        return new Vector(newX,newY);
    }
}