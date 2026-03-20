const products = Array.from({ length: 1000 }, (_, i) => ({ id: i + 1, name: `Product ${i + 1}`, price: 10 }));
const cart = Array.from({ length: 10000 }, (_, i) => ({ id: (i % 1000) + 1, quantity: 1 }));

// Baseline: products.find
const startFind = performance.now();
let totalFind = 0;
for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const product = products.find(p => p.id === item.id);
    totalFind += product.price * item.quantity;
}
const endFind = performance.now();
console.log(`products.find() took ${endFind - startFind} ms`);

// Optimized: productMap
const startMapSetup = performance.now();
const productMap = products.reduce((map, product) => {
    map[product.id] = product;
    return map;
}, {});
const endMapSetup = performance.now();

const startMap = performance.now();
let totalMap = 0;
for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const product = productMap[item.id];
    totalMap += product.price * item.quantity;
}
const endMap = performance.now();
console.log(`productMap setup took ${endMapSetup - startMapSetup} ms`);
console.log(`productMap lookup took ${endMap - startMap} ms`);
console.log(`Total optimized took ${(endMapSetup - startMapSetup) + (endMap - startMap)} ms`);
