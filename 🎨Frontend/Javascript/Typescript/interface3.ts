interface Car {
    color: string;
    wheels: number;
    start(): void;
}

interface Benz extends Car {
    door: number;
    stop(): void;
}

const benz : Benz = {
    color : "Blue", 
    wheels : 4,
    door : 5,
    start() {},
    stop() {
        console.log("go..");
    }
}

class Bmw implements Car {
    color;
    wheels = 4;

    constructor(c:string) {
        this.color = c;
    }

    start() {
        console.log("go..");
    }
}

const b = new Bmw('Red');

