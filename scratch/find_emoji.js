const fs = require('fs');
const lines = fs.readFileSync('src/app/profile/page.tsx', 'utf-8').split('\n');
lines.forEach((l, i) => {
  // Regex to find non-ASCII, non-Arabic, non-punctuation chars
  if (/[^\x00-\x7F\u0600-\u06FF\s\{\}\(\)\<\>\=\`\"\'\-\_\:\;\,\.\/\#\[\]\|\\]/.test(l)) {
    console.log(i + 1, ':', l.trim());
  }
});
