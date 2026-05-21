// Test what happens if we change the original tags arrays to sets
const productsArray = [
  { id: 1, tags: ["crazy", "design"] },
  { id: 2, tags: ["couplegoals"] },
  { id: 3, tags: ["couplegoals", "design"] }
];

const productsSet = [
  { id: 1, tags: new Set(["crazy", "design"]) },
  { id: 2, tags: new Set(["couplegoals"]) },
  { id: 3, tags: new Set(["couplegoals", "design"]) }
];

console.log("Original array format:");
console.log(productsArray[0].tags.includes("crazy"));

console.log("Set format:");
console.log(productsSet[0].tags.has("crazy"));
