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
        let arr = [...arguments];
        arr.forEach(arg => {if(arg) {if (!(arg instanceof Vector))
            throw(new Error(`Это не вектор`));
        }
        })

        this.pos = pos||new Vector(0,0);
        this.size = size||new Vector(1,1);
        this.speed = speed||new Vector(0,0);
        this.type = `actor`;
        /*
         Object.defineProperty(this, "type", {
         value: "actor",
         writable: true, // запретить присвоение
         configurable: false // запретить удаление
         });
         */
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

class Level {
    constructor(grid, actors) {
        this.grid = grid || [];
        this.actors = actors || [];
        this.player = new Actor();
        this.height = (this.grid) ? this.grid.length : 0;
        this.width = (this.grid && this.grid[0]) ? this.grid[0].length : 0; //todo выбрать большее
        this.status = null;
        this.finishDelay = 1;
        this.player = new Actor();
        this.player.type = 'player';
        this.player.title = 'Игрок';
    }

    isFinished() {
        return (!(this.status === null)) ? this.finishDelay < 0 : false

    }

    actorAt(actor) {
        if (!(actor instanceof Actor) || actor === undefined) {
            throw(new Error(`Это не актор!`));
        }
        if (!(Array.isArray(this.actors))) return undefined;
        const res = [];
        this.actors.forEach(act => {
            if (act.isIntersect(actor))
        res.push(act);
    })
        return res[0];
    }

    obstacleAt(where, size) {
        if (!(where instanceof Vector) || !(size instanceof Vector)) {
            throw(new Error(`Это не вектор`));
        }
        let futureActor = new Actor(where, size);
        if (futureActor.left < 0 ||
            futureActor.right > this.width - 1 ||
            futureActor.top > this.height - 1)
            return `wall`;
        if (futureActor.bottom < 0)
            return `lava`;

        let obj = this.grid[where.x][where.y];
        return obj;
    }

    removeActor(actor) {
        let idx = this.actors.indexOf(actor);
        this.actors.splice(idx, 1);
    }

    noMoreActors(type) {
        if (this.actors.length === 0) return true;
        return !this.actors.some(act => act.type == type);
    }

    playerTouched(type, actor) {
        if (this.isFinished()) return;

        switch (type) {
            case 'lava ':
                this.status = `lost`;
                break;
            case 'fireball':
                this.status = `lost`;
                break;
            case 'coin':
                this.removeActor(actor);
                if (this.noMoreActors(type))
                    this.status = `won`;
                break;
            default:break;
        }
    }
}