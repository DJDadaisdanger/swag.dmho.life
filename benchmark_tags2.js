const NUM_PRODUCTS = 10000;
const TAGS_PER_PRODUCT = 5;

const productsArray = Array.from({ length: NUM_PRODUCTS }, (_, i) => {
  const tags = [];
  for (let j = 0; j < TAGS_PER_PRODUCT; j++) {
    tags.push(`tag_${Math.floor(Math.random() * 20)}`);
  }
  if (i % 100 === 0) tags.push("couplegoals");
  return { id: i, tags: tags };
});

const productsSet = productsArray.map(p => ({
  ...p,
  tags: new Set(p.tags)
}));

console.log("Starting Benchmark: Array.includes vs Set.has vs Pre-computed Index (10000 products)");

console.time("Array.filter + Array.includes");
for (let i = 0; i < 1000; i++) {
  productsArray.filter((p) => p.tags.includes("couplegoals"));
}
console.timeEnd("Array.filter + Array.includes");

console.time("Array.filter + Set.has");
for (let i = 0; i < 1000; i++) {
  productsSet.filter((p) => p.tags.has("couplegoals"));
}
console.timeEnd("Array.filter + Set.has");

const productsByTag = {};
for (const p of productsArray) {
  for (const tag of p.tags) {
    if (!productsByTag[tag]) productsByTag[tag] = [];
    productsByTag[tag].push(p);
  }
}

console.time("Pre-computed Index (O(1) lookup)");
for (let i = 0; i < 1000; i++) {
  const res = productsByTag["couplegoals"] || [];
}
console.timeEnd("Pre-computed Index (O(1) lookup)");
