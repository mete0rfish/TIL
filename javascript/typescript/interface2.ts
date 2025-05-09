interface Add {
    (num1:number, num2:number): number;
}

const add : Add = function(x, y) {
    return x + y;
}

add(10, 20);

interface IsAdult {
    (age:number):boolean;
}

const a:IsAdult = (age) => {
    return age > 19;
}

a(33);
