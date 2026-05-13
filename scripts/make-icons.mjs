import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';

const sizes = [16, 32, 48, 128, 256, 512];
const icoSizes = [256, 128, 48, 32, 16];
const logoPath = './logo/logo.png';
const iconsDir = './assets/icons';
const icoPath = './assets/icon.ico';

async function generateIcons() {
  if (!fs.existsSync(logoPath)) {
    console.error(`Logo not found at ${logoPath}`);
    process.exit(1);
  }

  console.log('Generating resized PNGs...');
  const pngPaths = [];

  for (const size of sizes) {
    const outPath = path.join(iconsDir, `${size}x${size}.png`);
    await sharp(logoPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`  ${size}x${size}.png`);

    if (icoSizes.includes(size)) {
      pngPaths.push(outPath);
    }
  }

  console.log('Generating icon.ico...');
  const icoBuffer = await pngToIco(pngPaths);
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`  ${icoPath}`);

  console.log('\nDone!');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
