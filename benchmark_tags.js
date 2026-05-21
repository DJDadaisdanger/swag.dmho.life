const NUM_PRODUCTS = 10000;
const TAGS_PER_PRODUCT = 5;

// Generate dummy data
const products = Array.from({ length: NUM_PRODUCTS }, (_, i) => {
  const tags = [];
  for (let j = 0; j < TAGS_PER_PRODUCT; j++) {
    tags.push(`tag_${Math.floor(Math.random() * 20)}`);
  }
  if (i % 100 === 0) tags.push("couplegoals");
  return {
    id: i,
    tags: tags
  };
});

console.log("Starting Benchmark");

console.time("Array.filter + Array.includes");
for (let i=0; i<100; i++) {
  products.filter((p) => p.tags && p.tags.includes("couplegoals"));
}
console.timeEnd("Array.filter + Array.includes");

const productsByTag = {};
for (const p of products) {
  if (p.tags) {
    for (const tag of p.tags) {
      if (!productsByTag[tag]) productsByTag[tag] = [];
      productsByTag[tag].push(p);
    }
  }
}

console.time("Pre-computed Index (O(1) lookup)");
for (let i=0; i<100; i++) {
  const res = productsByTag["couplegoals"] || [];
}
console.timeEnd("Pre-computed Index (O(1) lookup)");
