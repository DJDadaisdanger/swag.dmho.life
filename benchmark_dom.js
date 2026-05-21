const { JSDOM } = require("jsdom");

const dom = new JSDOM(`<!DOCTYPE html><body><div id="productsGrid"></div></body>`);
const document = dom.window.document;

let html = "";
for (let i = 0; i < 10000; i++) {
  html += `
    <div class="product-card" data-id="${i}">
      <button id="wishlist-btn-${i}" class="wishlist-btn"></button>
    </div>
  `;
}
document.getElementById("productsGrid").innerHTML = html;

console.time("querySelector");
for (let i = 0; i < 1000; i++) {
  const btn = document.querySelector(`.product-card[data-id="${i}"] .wishlist-btn`);
}
console.timeEnd("querySelector");

console.time("getElementById");
for (let i = 0; i < 1000; i++) {
  const btn = document.getElementById(`wishlist-btn-${i}`);
}
console.timeEnd("getElementById");
