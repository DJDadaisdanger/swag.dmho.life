const { JSDOM } = require("jsdom");
const fs = require("fs");

const dom = new JSDOM(`<!DOCTYPE html><body>
  <div id="productsGrid"></div>
  <button id="wishlistBtn"></button>
  <div id="wishlistSidebar"></div>
  <div id="wishlistBadge"></div>
</body>`, { runScripts: "dangerously" });
