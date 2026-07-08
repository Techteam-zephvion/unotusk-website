const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '..', 'public', 'favicon.png');
const outputPath = path.join(__dirname, '..', 'favicon_info.txt');

try {
  const data = fs.readFileSync(pngPath);
  fs.writeFileSync(outputPath, `Favicon exists! Size: ${data.length} bytes\n`);
  
  // Let's read PNG dimensions from the IHDR chunk
  // PNG header is 8 bytes: 89 50 4E 47 0D 0A 1A 0A
  // IHDR chunk starts at byte 8.
  // Chunk length: 4 bytes (offset 8)
  // Chunk type: 4 bytes (offset 12) - should be 'IHDR' (49 48 44 52)
  // Width: 4 bytes (offset 16)
  // Height: 4 bytes (offset 20)
  if (data.readUInt32BE(12) === 0x49484452) {
    const width = data.readUInt32BE(16);
    const height = data.readUInt32BE(20);
    fs.appendFileSync(outputPath, `Dimensions: ${width}x${height}\n`);
  } else {
    fs.appendFileSync(outputPath, 'Not a standard PNG or IHDR chunk not found at expected offset.\n');
  }
} catch (err) {
  fs.writeFileSync(outputPath, `Error: ${err.message}\n`);
}
