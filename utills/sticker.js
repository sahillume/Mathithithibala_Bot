/**
 * Sticker Creation Utilities (FIXED + PRODUCTION READY)
 */

const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const config = require('../config');

/**
 * CORE STICKER FUNCTION
 */
const createStickerBuffer = async (media, options = {}) => {
  try {
    if (!media || !Buffer.isBuffer(media)) {
      throw new Error('Invalid media buffer');
    }

    const sticker = new Sticker(media, {
      pack: options.pack || config.packname || 'Mathithibala Bot',
      author: options.author || config.author || 'Professor Sahil',
      type: options.type || StickerTypes.FULL,
      categories: options.categories || ['🤖'],
      id: options.id || '',
      quality: options.quality || 50
    });

    return await sticker.toBuffer();
  } catch (error) {
    throw new Error(`Sticker creation failed: ${error.message}`);
  }
};

/**
 * FULL STICKER
 */
const createFullSticker = async (media, options = {}) => {
  return createStickerBuffer(media, {
    ...options,
    type: StickerTypes.FULL
  });
};

/**
 * CROPPED STICKER
 */
const createCroppedSticker = async (media, options = {}) => {
  return createStickerBuffer(media, {
    ...options,
    type: StickerTypes.CROPPED
  });
};

/**
 * CIRCLE STICKER
 */
const createCircleSticker = async (media, options = {}) => {
  return createStickerBuffer(media, {
    ...options,
    type: StickerTypes.CIRCLE
  });
};

module.exports = {
  createStickerBuffer,
  createFullSticker,
  createCroppedSticker,
  createCircleSticker
};
