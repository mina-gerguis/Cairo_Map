const potrace = require('potrace');
const fs = require('fs');

const params = {
  threshold: 128,
  optTolerance: 0.2,
  turdSize: 5,
  color: '#ffffff'
};

potrace.trace('public/images/brand/qareeb_blackbg.jpg', params, function(err, svg) {
  if (err) throw err;
  fs.writeFileSync('scripts/qareeb_white.svg', svg);
  console.log('Saved white SVG');
  
  // Extract paths
  const matches = svg.matchAll(/<path[^>]*d="([^"]+)"/g);
  let count = 0;
  for (const m of matches) {
    count++;
    console.log(`Path ${count} length: ${m[1].length}`);
    fs.writeFileSync(`scripts/qareeb_path_${count}.txt`, m[1]);
  }
});
