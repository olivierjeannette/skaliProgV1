import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const iconsDir = join(rootDir, 'public', 'icons');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Couleur vert forêt
const FOREST_GREEN = '#228B22';
const FOREST_GREEN_DARK = '#1a6b1a';

// SVG source with the Skali logo
const svgTemplate = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="${FOREST_GREEN}"/>
  <text x="256" y="300" font-family="Arial, sans-serif" font-size="200" font-weight="bold" text-anchor="middle" fill="white">S</text>
  <text x="256" y="420" font-family="Arial, sans-serif" font-size="60" font-weight="600" text-anchor="middle" fill="rgba(255,255,255,0.9)">SKALI</text>
</svg>`;

async function generateIcons() {
  console.log('Generating PWA icons...');

  // Ensure icons directory exists
  await mkdir(iconsDir, { recursive: true });

  // Generate icons for each size
  for (const size of sizes) {
    const outputPath = join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svgTemplate(512)))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`  Created: icon-${size}x${size}.png`);
  }

  // Generate Apple touch icon (180x180)
  const appleTouchPath = join(rootDir, 'public', 'apple-touch-icon.png');
  await sharp(Buffer.from(svgTemplate(512)))
    .resize(180, 180)
    .png()
    .toFile(appleTouchPath);
  console.log('  Created: apple-touch-icon.png');

  // Generate favicon (32x32)
  const faviconPath = join(rootDir, 'public', 'favicon-32x32.png');
  await sharp(Buffer.from(svgTemplate(512)))
    .resize(32, 32)
    .png()
    .toFile(faviconPath);
  console.log('  Created: favicon-32x32.png');

  // Generate shortcut icons
  const shortcutCalendarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="16" fill="${FOREST_GREEN}"/>
    <rect x="18" y="28" width="60" height="50" rx="6" fill="white"/>
    <rect x="18" y="28" width="60" height="14" rx="6" fill="${FOREST_GREEN_DARK}"/>
    <circle cx="32" cy="35" r="3" fill="white"/>
    <circle cx="64" cy="35" r="3" fill="white"/>
    <rect x="26" y="50" width="12" height="8" rx="2" fill="#d4edda"/>
    <rect x="42" y="50" width="12" height="8" rx="2" fill="${FOREST_GREEN}"/>
    <rect x="58" y="50" width="12" height="8" rx="2" fill="#d4edda"/>
    <rect x="26" y="62" width="12" height="8" rx="2" fill="#d4edda"/>
    <rect x="42" y="62" width="12" height="8" rx="2" fill="#d4edda"/>
  </svg>`;

  await sharp(Buffer.from(shortcutCalendarSvg))
    .resize(96, 96)
    .png()
    .toFile(join(iconsDir, 'shortcut-calendar.png'));
  console.log('  Created: shortcut-calendar.png');

  const shortcutWorkoutSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="16" fill="${FOREST_GREEN}"/>
    <rect x="20" y="42" width="56" height="12" rx="3" fill="white"/>
    <rect x="28" y="34" width="8" height="28" rx="2" fill="white"/>
    <rect x="60" y="34" width="8" height="28" rx="2" fill="white"/>
    <rect x="24" y="38" width="8" height="20" rx="2" fill="#a8d5a2"/>
    <rect x="64" y="38" width="8" height="20" rx="2" fill="#a8d5a2"/>
  </svg>`;

  await sharp(Buffer.from(shortcutWorkoutSvg))
    .resize(96, 96)
    .png()
    .toFile(join(iconsDir, 'shortcut-workout.png'));
  console.log('  Created: shortcut-workout.png');

  console.log('\\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
