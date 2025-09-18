abstract class Car {
    name: string = "car";
    color: string;
    
    constructor(color: string) {
        this.color = color;
    }

    start() {
        console.log("start");
    }

    abstract doSomething():void;
}

class Bmw extends Car {
    constructor(color: string) {
        super(color);
    }
    
    showName() {
        console.log(this.name);
    }

    doSomething(): void {
        
    }
}

const z4 = new Bmw("black");
console.log(z4.name);
