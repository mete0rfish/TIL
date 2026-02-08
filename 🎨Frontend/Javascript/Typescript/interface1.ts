type Score = 'A' | 'B' | 'C' | 'F';

interface User {
    name : string;
    age : number;
    gender? : string;
    readonly birthYear : number;
    [grade:number] : Score; // key = number, value : Score
}

let user : User = {
    name : 'xx',
    age : 30,
    birthYear : 2000,
    1 : 'A'
}