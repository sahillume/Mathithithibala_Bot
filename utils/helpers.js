/**
 * 🧰 Helper Utilities - Mathithibala_Bot
 * Optimized by Professor Sahil
 */

const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const FormData = require('form-data');

/**
 * 📥 Download media from WhatsApp message
 */
const downloadMedia = async (message) => {
  try {
    const type = Object.keys(message)[0];
    const media = message[type];

    const stream = await downloadContentFromMessage(
      media,
      type.replace('Message', '')
    );

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
  } catch (error) {
    throw new Error(`Media download failed: ${error.message}`);
  }
};

/**
 * ⏱ Format duration
 */
const formatDuration = (ms) => {
  const s = Math.floor((ms / 1000) % 60);
  const m = Math.floor((ms / (1000 * 60)) % 60);
  const h = Math.floor((ms / (1000 * 60 * 60)) % 24);

  return [
    h > 0 ? `${h}h` : null,
    m > 0 ? `${m}m` : null,
    s > 0 ? `${s}s` : null
  ].filter(Boolean).join(' ') || '0s';
};

/**
 * 📦 Format file size
 */
const formatSize = (bytes) => {
  if (!bytes) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * 😴 Sleep function
 */
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * 👤 Parse mentions
 */
const parseMentions = (text = '') => {
  return [...text.matchAll(/@(\d+)/g)].map(
    m => `${m[1]}@s.whatsapp.net`
  );
};

/**
 * 💬 Get quoted message safely
 */
const getQuoted = (msg) => {
  return msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
};

/**
 * 📤 Upload file (temporary hosting)
 */
const uploadFile = async (buffer) => {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename: 'file' });

    const res = await axios.post('https://file.io', form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    return res.data?.link || null;
  } catch {
    throw new Error('File upload failed');
  }
};

/**
 * 🔗 Extract URL
 */
const extractUrl = (text = '') => {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match ? match[0] : null;
};

/**
 * 🎲 Random element
 */
const random = (arr = []) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * 🌐 Check URL validity
 */
const isUrl = (text = '') => {
  try {
    return /^https?:\/\/.+\..+/.test(text);
  } catch {
    return false;
  }
};

/**
 * ⏳ Runtime formatter
 */
const runtime = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return [
    d ? `${d}d` : null,
    h ? `${h}h` : null,
    m ? `${m}m` : null,
    s ? `${s}s` : null
  ].filter(Boolean).join(' ') || '0s';
};

module.exports = {
  downloadMedia,
  formatDuration,
  formatSize,
  sleep,
  parseMentions,
  getQuoted,
  uploadFile,
  extractUrl,
  random,
  isUrl,
  runtime
};
