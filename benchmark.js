const products = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Product ${i}`,
  price: Math.random() * 100,
}));

const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

const testIds = Array.from({ length: 1000 }, () =>
  Math.floor(Math.random() * 10000)
);

console.log("Starting Benchmark: Array.find vs productMap (1000 lookups in 10000 products)");

console.time("Array.find");
testIds.forEach((id) => {
  products.find((p) => p.id === id);
});
console.timeEnd("Array.find");

console.time("productMap");
testIds.forEach((id) => {
  productMap[id];
});
console.timeEnd("productMap");
