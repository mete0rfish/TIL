// Generic

function getSize<T>(arr: T[]): number {
    return arr.length;
}

const arr1 = [1, 2, 3];
getSize<number>(arr1);

const arr2 = ["a", "b", "c"];
getSize(arr2);

// 예제

interface Mobile2<T> {
    name: string;
    price: number;
    option: T;
}

const m1: Mobile2<object> = {
    name: "s21",
    price: 1000,
    option: {
        color: "red",
        coupon: false,
    },
}

const m2: Mobile2<string> = {
    name: "s21",
    price: 1000,
    option: "good"
}
