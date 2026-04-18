/**
 * Instagram to Sticker Cropped Command
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

  for (const url of candidates) {
    if (url && typeof url === 'string' && url.startsWith('http')) {
      return url;
    }
  }

  return null;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

async function convertBufferToStickerWebp(inputBuffer, isVideo, cropSquare) {
  if (inputBuffer.length > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }

  const tmpDir = getTempDir();
  const base = path.join(tmpDir, `igs_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const input = isVideo ? `${base}.mp4` : `${base}.jpg`;
  const output = `${base}.webp`;

  const tempFiles = [input, output];

  try {
    fs.writeFileSync(input, inputBuffer);

    const vf = cropSquare
      ? "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512"
      : "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";

    const cmd = isVideo
      ? `ffmpeg -y -i "${input}" -t 2 -vf "${vf},fps=6" -c:v libwebp -quality 30 -loop 0 -pix_fmt yuva420p "${output}"`
      : `ffmpeg -y -i "${input}" -vf "${vf},format=rgba" -c:v libwebp -quality 60 -loop 0 -pix_fmt yuva420p "${output}"`;

    await new Promise((resolve, reject) => {
      exec(cmd, (err) => (err ? reject(err) : resolve()));
    });

    let buffer = fs.readFileSync(output);

    const img = new webp.Image();
    await img.load(buffer);

    const json = {
      'sticker-pack-id': crypto.randomBytes(16).toString('hex'),
      'sticker-pack-name': config.packname || 'Sticker Pack',
      'emojis': ['📸']
    };

    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');

    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    img.exif = exif;

    return await img.save(null);

  } finally {
    tempFiles.forEach(deleteTempFile);
  }
}

async function fetchBuffer(url) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    maxRedirects: 5
  });

  return Buffer.from(res.data);
}

async function igscCommand(sock, msg, args, extra, crop = true) {
  try {
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      args.join(' ');

    const match = text.match(/https?:\/\/\S+/);
    if (!match) {
      return extra.reply("Send an Instagram link.\nExample: .igsc <url>");
    }

    await sock.sendMessage(extra.from, {
      react: { text: '📥', key: msg.key }
    });

    const data = await igdl(match[0]).catch(() => null);

    if (!data?.data) {
      return extra.reply("❌ Failed to fetch Instagram media.");
    }

    const items = (data.data || [])
      .map(m => pickMediaUrl(m))
      .filter(Boolean)
      .slice(0, 10);

    if (!items.length) {
      return extra.reply("❌ No media found.");
    }

    const seen = new Set();

    for (let i = 0; i < items.length; i++) {
      try {
        const url = items[i];
        const buffer = await fetchBuffer(url);

        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        if (seen.has(hash)) continue;
        seen.add(hash);

        const isVideo = /\.(mp4|mov|webm)$/i.test(url);

        let sticker = await convertBufferToStickerWebp(buffer, isVideo, crop);

        if (sticker.length > 950 * 1024) {
          return extra.reply("⚠️ Sticker too large, skipped.");
        }

        await sock.sendMessage(extra.from, {
          sticker
        }, { quoted: msg });

        await new Promise(r => setTimeout(r, 700));

      } catch (e) {
        console.log("Item error:", e.message);
      }
    }

  } catch (err) {
    console.error("IGSC ERROR:", err);
    extra.reply("❌ Failed to process Instagram sticker.");
  }
}

module.exports = {
  name: 'igsc',
  aliases: ['igstickercrop'],
  description: 'Convert Instagram media to cropped square sticker',
  usage: '.igsc <Instagram URL>',
  category: 'media',

  async execute(sock, msg, args, extra) {
    await igscCommand(sock, msg, args, extra, true);
  }
};
