const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const svgTemplate = (size = 32) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 3h7v7H3z" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14 3h7v7h-7z" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14 14h7v7h-7z" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3 14h7v7H3z" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

async function generateFavicons() {
  const publicDir = path.join(__dirname, "../public");

  // Создаем SVG
  fs.writeFileSync(path.join(publicDir, "logo.svg"), svgTemplate(32));

  // Создаем PNG версии
  const sizes = [16, 32, 180];
  for (const size of sizes) {
    const filename =
      size === 180 ? "apple-touch-icon.png" : `favicon-${size}x${size}.png`;

    await sharp(Buffer.from(svgTemplate(size)))
      .png()
      .toFile(path.join(publicDir, filename));
  }

  // Для ICO файла может понадобиться дополнительная библиотека
  console.log(`
🎉 Favicons generated successfully!
📁 Files created in public/ directory:
   - logo.svg
   - favicon-16x16.png
   - favicon-32x32.png
   - apple-touch-icon.png
  `);
}

generateFavicons().catch(console.error);
