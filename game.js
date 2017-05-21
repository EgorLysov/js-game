'use strict';

class Vector {
    constructor(x=0,y=0) {
        this.x=x;
        this.y=y;
    }
    plus(vector) {
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
        let newX= this.x *multiplier;
        let newY= this.y *multiplier;
        return new Vector(newX,newY);
    }
}

class Actor {
    constructor(pos,size,speed) {
        let arr =[...arguments];
        arr.forEach(arg => {if(arg) {if (!(arg instanceof Vector))
            throw(new Error(`Это не вектор`));
        }});
        this.pos = pos||new Vector(0,0);
        this.size = size||new Vector(1,1);
        this.speed = speed||new Vector(0,0);
        Object.defineProperty(this, "type", {
            value: "actor",
            writable: false, // запретить присвоение
            configurable: false // запретить удаление
        });
    }
    act() {
    }
    get left(){
        return this.pos.x;
    }
    get top(){
        return this.pos.y;
    }
    get right(){
        return this.pos.x+this.size.x;
    }
    get bottom(){
        return this.pos.y+this.size.y;
    }

    isIntersect(actor) {
        if (!(actor instanceof Actor)|| actor === undefined) {
            throw(new Error(`Это не актор!`));
        }
        return !(this == actor ||
        this.right <= actor.left || //первый объект правая сторона, второй объект левая сторона
        this.left >= actor.right || //первый объект левая сторона, второй правая
        this.top >= actor.bottom || //первый объект верх, второй низ
        this.bottom <= actor.top); //первый объект низ, второй верх
    }

}