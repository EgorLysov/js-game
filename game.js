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
    }
    get type() {
        return `actor`;
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
        this.height = (this.grid) ? this.grid.length : 0;
        this.width = (this.grid && this.grid[0]) ? this.grid.slice().sort((a,b) => b.length-a.length)[0].length : 0;
        this.status = null;
        this.finishDelay = 1;
     }

    get player() {
        return this.actors.find(actor => actor.type === 'player');
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
        const futureActor = new Actor(where,size);

        let leftArea = Math.floor(where.x);
        let rightArea = Math.ceil(where.x + size.x);
        let topArea = Math.floor(where.y);
        let bottomArea = Math.ceil(where.y + size.y);


        if (futureActor.bottom > this.height)
            return 'lava';

        if ((futureActor.left < 0) || (futureActor.top < 0) || (futureActor.right > this.width))
            return 'wall';
        const area = [];
        for(let i = topArea; i < bottomArea; i++) {
            area.push(...this.grid[i].slice(leftArea, rightArea+1));
        }

        return area.find(v  => v)
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
              if (constr&&(typeof(constr)===`function`)) {
                  let actor = new constr(new Vector(x, y));
                  if (actor instanceof Actor) { //в задаче есть, а тесты валит, там класс MyActor не актор
                      result.push(actor);
                  }
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
    }
    get type() {
        return `player`;
    }
}

class Fireball extends Actor {
    constructor(pos,speed) {
        let size = new Vector(1,1);
        super(pos,size,speed);
    }
    get type() {
        return `fireball`;
    }
    getNextPosition(multiplier=1) {
        return this.pos.plus(this.speed.times(multiplier));
    }
    handleObstacle() {
        this.speed = this.speed.times(-1);
    }
    act(time,level) {
        let nextPosition = this.getNextPosition(time);
        let obstacle = level.obstacleAt(nextPosition,this.size);
        if (obstacle) {
            this.handleObstacle();
        } else {
            this.pos = nextPosition;
        }
    }
}

class HorizontalFireball extends Fireball {
    constructor(pos) {
        let speed = new Vector(2,0);
        super(pos,speed);
    }
}

class VerticalFireball extends Fireball {
    constructor(pos) {
        let speed = new Vector(0,2);
        super(pos,speed);
    }
}

class FireRain extends Fireball {
    constructor(pos) {
        let speed = new Vector(0,3);
        super(pos,speed);
        this.firstPos = pos;
    }
    handleObstacle() {
        this.pos = this.firstPos;
    }
}

class Coin extends Actor {
    constructor(pos) {
        let size = new Vector(0.6,0.6);
        super(pos,size);
        this.pos = this.pos.plus(new Vector(0.2,0.1));
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.spring = Math.random() * 2*Math.PI;
    }
    get type() {
        return `coin`;
    }
    updateSpring(time=1){
        this.spring += this.springSpeed*time;
    }
    getSpringVector(){
        return new Vector(0,Math.sin(this.spring)*this.springDist)
    }
    getNextPosition(time){
        this.updateSpring(time);
        return this.pos.plus(this.getSpringVector())
    }
    act(time) {
        this.pos = this.getNextPosition(time);
    }
}



const actorDict = {
    '@': Player,
    '=': HorizontalFireball,
    '|': VerticalFireball,
    'v': FireRain,
    'o': Coin
}
const parser = new LevelParser(actorDict);
loadLevels()
    .then(result => {
        let schemas = JSON.parse(result);
        runGame(schemas, parser, DOMDisplay)
        .then(() => alert('Вы выиграли приз!'))
    });

