const productsArray = Array.from({ length: 10000 }, (_, i) => {
  return {
    id: i,
    tags: ["a", "b", "c", i % 100 === 0 ? "couplegoals" : "d", "e"]
  };
});

const productsSet = productsArray.map(p => ({
  ...p,
  tags: new Set(p.tags)
}));

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
