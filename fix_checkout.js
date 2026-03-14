const fs = require('fs');
let content = fs.readFileSync('checkout.html', 'utf8');

// The backticks inside the template literal strings might be escaped as \` but sed removes the backslash so \` becomes `
// Let's verify checkout.html

fs.writeFileSync('checkout.html', content);
