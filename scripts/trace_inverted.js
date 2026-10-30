const potrace = require('potrace');
const sharp = require('sharp');
const fs = require('fs');

async function run() {
  // Negate so the white logo becomes black, and black background becomes white!
  const invertedBuf = await sharp('public/images/brand/qareeb_blackbg.jpg')
    .negate()
    .toBuffer();

  potrace.trace(invertedBuf, {
    threshold: 128,
    optTolerance: 0.15,
    turdSize: 10
  }, function(err, svg) {
    if (err) throw err;
    fs.writeFileSync('scripts/qareeb_logo_vector.svg', svg);
    
    // Also extract the path 'd'
    const match = svg.match(/<path[^>]*d="([^"]+)"/);
    if (match) {
      console.log('Successfully traced logo! Path length:', match[1].length);
      fs.writeFileSync('scripts/qareeb_path_pure.txt', match[1]);
    }
  });
}

run();
