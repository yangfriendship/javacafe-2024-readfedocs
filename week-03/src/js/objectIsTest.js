const obj1 = {
    name: 'yangfriendship'
}

const obj2 = {
    name: 'yangfriendship'
}

console.log(Object.is(obj1, obj2));
console.log(Object.is(1, 1));
console.log(Object.is(NaN, NaN));
console.log(NaN === NaN);
console.log(+0 === -0);
console.log(Object.is(+0, -0));
