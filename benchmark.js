const products = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.random() * 100,
}));

const cart = Array.from({ length: 1000 }, (_, i) => ({
  id: Math.floor(Math.random() * 1000) + 1,
  quantity: Math.floor(Math.random() * 5) + 1,
}));

// Baseline using find
console.time('Baseline: cart total using find()');
for (let i = 0; i < 10000; i++) {
  const total = cart.reduce((acc, item) => {
    const product = products.find((p) => p.id === item.id);
    return acc + product.price * item.quantity;
  }, 0);
}
console.timeEnd('Baseline: cart total using find()');

// Optimized using Map
const productMap = products.reduce((map, p) => {
  map[p.id] = p;
  return map;
}, {});

console.time('Optimized: cart total using productMap');
for (let i = 0; i < 10000; i++) {
  const total = cart.reduce((acc, item) => {
    const product = productMap[item.id];
    return acc + product.price * item.quantity;
  }, 0);
}
console.timeEnd('Optimized: cart total using productMap');
