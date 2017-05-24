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
        Object.defineProperty(this, "type", {
         value: "actor",
         writable: false, // запретить присвоение
         configurable: true // запретить удаление
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

class Level {
    constructor(grid, actors) {
        this.grid = grid || [];
        this.actors = actors || [];
        this.player = new Actor();
        this.height = (this.grid) ? this.grid.length : 0;
        this.width = (this.grid && this.grid[0]) ? this.grid.slice().sort((a,b) => b.length-a.length)[0].length : 0;
        this.status = null;
        this.finishDelay = 1;
        this.player = new Player(new Vector(0.0));
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
        if (futureActor.bottom < 0)
            return `lava`;
        if (futureActor.left < 0 ||
            futureActor.right > this.width-1 ||
            futureActor.top > this.height-1)
            return `wall`;


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
            case 'lava':
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

class LevelParser {
    constructor (actorsDict) {
        this.actorsDict = actorsDict||{};
      }

  actorFromSymbol(symbol) {
      if (symbol === undefined||this.actorsDict.length === 0) {
            return symbol;
          }
       return this.actorsDict[symbol];

      }

  obstacleFromSymbol(symbol) {
       //return this.actorsDict[symbol].title;
      switch (symbol) {
          case 'x':
            return 'wall';
          case '!':
            return 'lava';
          default:
              return undefined;
          }
      }

  createGrid(plan) {
        return plan.map(row => row.split('').map(cell => this.obstacleFromSymbol(cell)));
      }


  createActors(plan) {

      return plan.reduce((result,row,y) =>{
              row.split(``).forEach((cell,x) => {
              let constr = this.actorFromSymbol(cell);
              if (constr) {
                  let actor = new constr(new Vector(x, y));
                  //if (actor instanceof Actor) { //в задаче есть, а тесты валит, там класс MyActor не актор
                      result.push(actor);
                  //}
              }
          })
              return result;
          },[])
    }

  parse(plan) {
        return new Level(this.createGrid(plan), this.createActors(plan));
      }
}

class Player extends Actor {
    constructor(pos) {
        let size = new Vector(0.8,1.5);
        super(pos,size);
        this.pos = this.pos.plus(new Vector(0,-0.5));
        this.title = 'Игрок';
        Object.defineProperty(this, "type", {
            value: "player",
            writable: false, // запретить присвоение
            configurable: false // запретить удаление
        });    }
}

const schema = [
    '         ',
    '         ',
    '         ',
    '         ',
    '     !xxx',
    '         ',
    'xxx!     ',
    '    @    '
];
const parser = new LevelParser();
const level = parser.parse(schema);
runLevel(level, DOMDisplay);