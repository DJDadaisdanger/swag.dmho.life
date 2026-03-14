const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');
content = content.replace("            </div>\\n        \\`;", "            </div>\\n        `;");
fs.writeFileSync('app.js', content);
