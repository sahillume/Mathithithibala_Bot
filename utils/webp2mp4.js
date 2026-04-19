/**
 * WebP to PNG / GIF / MP4 Converter (Clean Version)
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { getTempDir, deleteTempFile } = require('./tempManager');

/**
 * Convert WebP → PNG
 */
async function webp2png(webpBuffer) {
  try {
    const sharp = require('sharp');
    return await sharp(webpBuffer).png().toBuffer();
  } catch (err) {
    const tempDir = getTempDir();
    const input = path.join(tempDir, `in_${Date.now()}.webp`);
    const output = path.join(tempDir, `out_${Date.now()}.png`);

    try {
      fs.writeFileSync(input, webpBuffer);

      await new Promise((resolve, reject) => {
        exec(
          `"${ffmpegPath}" -i "${input}" -frames:v 1 -y "${output}"`,
          (err) => (err ? reject(err) : resolve())
        );
      });

      return fs.readFileSync(output);
    } finally {
      deleteTempFile(input);
      deleteTempFile(output);
    }
  }
}

/**
 * Convert WebP → GIF (animated support)
 */
async function webp2gif(webpBuffer) {
  const tempDir = getTempDir();
  const input = path.join(tempDir, `in_${Date.now()}.webp`);
  const output = path.join(tempDir, `out_${Date.now()}.gif`);

  try {
    fs.writeFileSync(input, webpBuffer);

    await new Promise((resolve, reject) => {
      exec(
        `"${ffmpegPath}" -i "${input}" -vf "fps=15,scale=512:512:flags=lanczos" -loop 0 -y "${output}"`,
        (err) => (err ? reject(err) : resolve())
      );
    });

    return fs.readFileSync(output);
  } finally {
    deleteTempFile(input);
    deleteTempFile(output);
  }
}

/**
 * Convert WebP → MP4
 */
async function webp2mp4(webpBuffer) {
  const tempDir = getTempDir();
  const input = path.join(tempDir, `in_${Date.now()}.webp`);
  const output = path.join(tempDir, `out_${Date.now()}.mp4`);

  try {
    fs.writeFileSync(input, webpBuffer);

    await new Promise((resolve, reject) => {
      exec(
        `"${ffmpegPath}" -i "${input}" -vf "fps=15,scale=512:512:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -y "${output}"`,
        (err) => (err ? reject(err) : resolve())
      );
    });

    return fs.readFileSync(output);
  } finally {
    deleteTempFile(input);
    deleteTempFile(output);
  }
}

module.exports = {
  webp2png,
  webp2gif,
  webp2mp4
};
