const wishlist = Array.from({ length: 1000 }, (_, i) => i * 2);
const products = Array.from({ length: 10000 }, (_, i) => ({ id: i }));

console.log("Starting Benchmark: Array.includes vs Set.has (10000 lookups against 1000 items)");

console.time("Array.includes");
let c1 = 0;
products.forEach(p => {
    if (wishlist.includes(p.id)) c1++;
});
console.timeEnd("Array.includes");

const wishlistSet = new Set(wishlist);
console.time("Set.has");
let c2 = 0;
products.forEach(p => {
    if (wishlistSet.has(p.id)) c2++;
});
console.timeEnd("Set.has");

console.log(`Results check: ${c1} === ${c2}`);
