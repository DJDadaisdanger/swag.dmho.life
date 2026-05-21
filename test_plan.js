const productsArray = [
  { id: 1, tags: ["crazy", "design"] },
  { id: 2, tags: ["couplegoals"] },
  { id: 3, tags: ["couplegoals", "design"] }
];

const productsByTag = {};
for (const p of productsArray) {
  for (const tag of p.tags) {
    if (!productsByTag[tag]) productsByTag[tag] = [];
    productsByTag[tag].push(p);
  }
}

console.log(productsByTag["couplegoals"]);
