const wishlist = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000));
const products = Array.from({ length: 10000 }, (_, i) => ({ id: i }));

console.log("Starting Benchmark: Array.includes vs Set.has (10000 iterations over 1000 items)");

console.time("Array.includes");
products.map(p => wishlist.includes(p.id));
console.timeEnd("Array.includes");

console.time("Set.has");
const wishlistSet = new Set(wishlist);
products.map(p => wishlistSet.has(p.id));
console.timeEnd("Set.has");
