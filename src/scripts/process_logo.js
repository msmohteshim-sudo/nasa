import sharp from 'sharp';
import path from 'path';

async function processImage() {
  const inputPath = 'C:/Users/Admin/.gemini/antigravity-ide/brain/21f4b7c0-05ca-49fb-ac91-976b7313cd63/.user_uploaded/media_1791188685266.jpg';
  
  // Crop the emblem region: approximately x: 80 to 944, y: 15 to 680
  const { data, info } = await sharp(inputPath)
    .extract({ left: 70, top: 15, width: 884, height: 670 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('Extracted dimensions:', info.width, info.height, info.channels);

  // Let's create an RGBA buffer with background transparency
  const rgbaBuffer = Buffer.alloc(info.width * info.height * 4);
  const cx = info.width / 2;
  const cy = 350; // approximate center of the core
  const maxRadius = 430;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 3;
      const outIdx = (y * info.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const brightness = Math.max(r, g, b);
      const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      // Outside the emblem radius or low brightness background
      let alpha = 255;
      
      // Background in deep space is near black
      // Let's use soft luminance keying for dark background
      if (brightness < 18 && distFromCenter > 250) {
        alpha = 0;
      } else if (brightness < 35 && distFromCenter > 280) {
        alpha = Math.round(((brightness - 18) / 17) * 255);
      }

      // Suppress the space station in the top right corner (x > 650, y < 140)
      if (x > 670 && y < 130 && brightness < 150) {
        alpha = 0;
      }

      // Suppress bottom corners where Earth's atmosphere starts (below the main emblem)
      if (y > 600) {
        const bottomFade = Math.max(0, 1 - (y - 600) / 70);
        alpha = Math.round(alpha * bottomFade);
      }

      rgbaBuffer[outIdx] = r;
      rgbaBuffer[outIdx + 1] = g;
      rgbaBuffer[outIdx + 2] = b;
      rgbaBuffer[outIdx + 3] = alpha;
    }
  }

  await sharp(rgbaBuffer, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toFile('c:/Users/Admin/OneDrive/Desktop/altron/src/assets/altron_emblem_isolated.png');

  console.log('Saved isolated emblem to src/assets/altron_emblem_isolated.png');
}

processImage().catch(console.error);
