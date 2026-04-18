/**
 * Instagram to Sticker Commands
 * igs - Convert Instagram media to sticker (padding, maintains aspect ratio)
 * igsc - Convert Instagram media to cropped square sticker
 */

const { igdl } = require('ruhend-scraper');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');
const config = require('../../config');
const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

/**
 * Extract unique media items
 */
function extractUniqueMedia(mediaData) {
  const uniqueMedia = [];
  const seenUrls = new Set();

  for (const media of mediaData) {
    if (!media?.url) continue;

    if (!seenUrls.has(media.url)) {
      seenUrls.add(media.url);
      uniqueMedia.push(media);
    }
  }

  return uniqueMedia;
}

/**
 * Pick best media URL
 */
function pickMediaUrl(media) {
  if (!media) return null;

  const candidates = [
    media.downloadUrl,
    media.url,
    media.original,
    media.mediaUrl,
    media.videoUrl,
    media.imageUrl,
    media.urls?.[0]
  ];

  for (const c of candidates) {
    if (c && typeof c === 'string' && c.startsWith('http')) {
      return c;
    }
  }

  return null;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Convert buffer → WebP sticker
 */
async function convertBufferToStickerWebp(inputBuffer, isAnimated, cropSquare) {
  if (inputBuffer.length > MAX_FILE_SIZE) {
    throw new Error(`File too large`);
  }

  const tmpDir = getTempDir();
  const base = path.join(tmpDir, `igs_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const input = isAnimated ? `${base}.mp4` : `${base}.jpg`;
  const output = `${base}.webp`;

  const tempFiles = [input, output];

  try {
    fs.writeFileSync(input, inputBuffer);

    const vfCrop = "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512";
    const vfPad = "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";

    let cmd;

    if (isAnimated) {
      cmd = `ffmpeg -y -i "${input}" -t 2 -vf "${cropSquare ? vfCrop : vfPad},fps=6" -c:v libwebp -quality 30 -preset default -loop 0 "${output}"`;
    } else {
      cmd = `ffmpeg -y -i "${input}" -vf "${cropSquare ? vfCrop : vfPad},format=rgba" -c:v libwebp -quality 60 -preset default -loop 0 "${output}"`;
    }

    await new Promise((res, rej) => {
      exec(cmd, (err) => (err ? rej(err) : res()));
    });

    let buffer = fs.readFileSync(output);

    // 🔥 reduced fallback pressure (prevents freezing)
    let attempts = 0;
    while (buffer.length > 950 * 1024 && attempts < 4) {
      attempts++;

      const smallOut = `${base}_small_${attempts}.webp`;
      tempFiles.push(smallOut);

      const size = 512 - attempts * 80;
      const q = 25 - attempts * 5;

      const cmd2 = isAnimated
        ? `ffmpeg -y -i "${input}" -t 1.5 -vf "scale=${size}:${size},fps=5" -c:v libwebp -quality ${q} -loop 0 "${smallOut}"`
        : `ffmpeg -y -i "${input}" -vf "scale=${size}:${size},format=rgba" -c:v libwebp -quality ${q} -loop 0 "${smallOut}"`;

      await new Promise((res, rej) => {
        exec(cmd2, (err) => (err ? rej(err) : res()));
      });

      if (fs.existsSync(smallOut)) {
        buffer = fs.readFileSync(smallOut);
      }
    }

    return buffer;
  } finally {
    tempFiles.forEach(deleteTempFile);
  }
}

/**
 * Fetch media buffer
 */
async function fetchBufferFromUrl(url) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    maxRedirects: 5,
    validateStatus: s => s >= 200 && s < 400 // FIXED
  });

  return Buffer.from(res.data);
}

/**
 * MAIN COMMAND
 */
async function igsCommand(sock, msg, args, extra, crop = false) {
  try {
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      args.join(' ');

    const url = text.match(/https?:\/\/\S+/);
    if (!url) {
      return extra.reply('Send Instagram link');
    }

    await sock.sendMessage(extra.from, {
      react: { text: '📥', key: msg.key }
    });

    const data = await igdl(url[0]).catch(() => null);
    if (!data?.data) return extra.reply('Failed to fetch IG media');

    // FIXED: actually using unique filter
    const items = extractUniqueMedia(data.data)
      .filter(m => pickMediaUrl(m))
      .slice(0, 10);

    if (!items.length) return extra.reply('No media found');

    const seen = new Set();

    for (const media of items) {
      try {
        const mediaUrl = pickMediaUrl(media);
        if (!mediaUrl) continue;

        const buffer = await fetchBufferFromUrl(mediaUrl);

        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        if (seen.has(hash)) continue;
        seen.add(hash);

        const isVideo = (media?.type === 'video') || /\.mp4|mov|mkv/i.test(mediaUrl);

        let sticker = await convertBufferToStickerWebp(buffer, isVideo, crop);

        await sock.sendMessage(extra.from, {
          sticker
        }, { quoted: msg });

        await new Promise(r => setTimeout(r, 700));

      } catch (err) {
        console.log("Item error:", err.message);
      }
    }

  } catch (err) {
    console.log("IGS ERROR:", err);
    extra.reply('Sticker conversion failed');
  }
}

module.exports = {
  name: 'igs',
  aliases: ['igsticker'],
  description: 'Instagram to sticker',
  usage: '.igs <url>',
  category: 'media',

  async execute(sock, msg, args, extra) {
    await igsCommand(sock, msg, args, extra, false);
  }
};
