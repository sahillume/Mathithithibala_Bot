/**
 * Sticker Converter using FFmpeg (FIXED + PRODUCTION READY)
 */

const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { getTempDir, deleteTempFile } = require('./tempManager');

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Convert media (image/video) → WebP sticker
 */
const convertToSticker = async (mediaBuffer, options = {}) => {
  if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
    throw new Error('Invalid media buffer');
  }

  if (mediaBuffer.length > MAX_FILE_SIZE) {
    throw new Error(
      `File too large: ${(mediaBuffer.length / 1024 / 1024).toFixed(2)}MB`
    );
  }

  const tempDir = getTempDir();
  const inputPath = path.join(
    tempDir,
    `input_${Date.now()}.${options.isVideo ? 'mp4' : 'jpg'}`
  );
  const outputPath = path.join(tempDir, `output_${Date.now()}.webp`);

  try {
    fs.writeFileSync(inputPath, mediaBuffer);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-vf scale=512:512:force_original_aspect_ratio=decrease',
          '-vcodec libwebp',
          '-lossless 0',
          '-q:v 70',
          '-preset default',
          '-loop 0',
          '-an'
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    const stickerBuffer = fs.readFileSync(outputPath);
    return stickerBuffer;
  } catch (error) {
    throw new Error(`Sticker conversion failed: ${error.message}`);
  } finally {
    deleteTempFile(inputPath);
    deleteTempFile(outputPath);
  }
};

/**
 * Add metadata (packname + author)
 */
const addStickerMetadata = async (
  stickerBuffer,
  packname = 'Bot',
  author = 'Owner'
) => {
  try {
    const webpmux = require('node-webpmux');

    const img = new webpmux.Image();
    await img.load(stickerBuffer);

    const json = {
      'sticker-pack-name': packname,
      'sticker-pack-publisher': author
    };

    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);

    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf-8');
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);

    img.exif = exif;

    return await img.save(null);
  } catch (error) {
    console.warn('Metadata failed, returning plain sticker:', error.message);
    return stickerBuffer;
  }
};

/**
 * MAIN FUNCTION: Media → Sticker
 */
const createSticker = async (
  mediaBuffer,
  isVideo = false,
  packname = 'Bot',
  author = 'Owner'
) => {
  try {
    let sticker = await convertToSticker(mediaBuffer, { isVideo });
    sticker = await addStickerMetadata(sticker, packname, author);
    return sticker;
  } catch (error) {
    throw new Error(`Failed to create sticker: ${error.message}`);
  }
};

module.exports = {
  convertToSticker,
  addStickerMetadata,
  createSticker
};
