/**
 * TikTok Downloader - Enhanced Version
 * Powered by Mathithibala_Bot | Professor Sahil AI
 */

const { ttdl } = require('ruhend-scraper');
const axios = require('axios');
const APIs = require('../../utils/api');
const config = require('../../config');

const processedMessages = new Set();

module.exports = {
  name: 'tiktok',
  aliases: ['tt', 'ttdl', 'tiktokdl'],
  category: 'media',
  description: 'Download TikTok videos',
  usage: '.tiktok <TikTok URL>',

  async execute(sock, msg, args) {
    try {
      if (processedMessages.has(msg.key.id)) return;

      processedMessages.add(msg.key.id);
      setTimeout(() => processedMessages.delete(msg.key.id), 5 * 60 * 1000);

      const text = msg.message?.conversation ||
                   msg.message?.extendedTextMessage?.text ||
                   args.join(' ');

      const url = text.split(' ').find(t => t.includes('tiktok'));

      if (!url) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❌ Please provide a valid TikTok link.'
        }, { quoted: msg });
      }

      const patterns = [
        /https?:\/\/.*tiktok\.com\//,
        /https?:\/\/vm\.tiktok\.com\//,
        /https?:\/\/vt\.tiktok\.com\//
      ];

      const isValid = patterns.some(p => p.test(url));

      if (!isValid) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❌ Invalid TikTok URL.'
        }, { quoted: msg });
      }

      // ⏳ WAIT MESSAGE (Sahil AI style)
      await sock.sendMessage(msg.key.remoteJid, {
        text: `⏳ *Wait... Sahil AI is downloading your TikTok video*\n\n⚡ Processing request...\n🎬 Please wait ~30 seconds`
      }, { quoted: msg });

      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: '🔄', key: msg.key }
      });

      let videoUrl = null;
      let title = null;

      // API FIRST
      try {
        const result = await APIs.getTikTokDownload(url);
        videoUrl = result.videoUrl;
        title = result.title;
      } catch (e) {}

      // FALLBACK ttdl
      if (!videoUrl) {
        try {
          const data = await ttdl(url);

          if (data?.data?.length) {
            const media = data.data.find(m => m.type === 'video') || data.data[0];

            if (media?.url) {
              videoUrl = media.url;
            }
          }
        } catch (e) {}
      }

      if (!videoUrl) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❌ Failed to fetch TikTok video.'
        }, { quoted: msg });
      }

      // DOWNLOAD VIDEO
      let buffer;

      try {
        const res = await axios.get(videoUrl, {
          responseType: 'arraybuffer',
          timeout: 60000,
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://www.tiktok.com/'
          }
        });

        buffer = Buffer.from(res.data);
      } catch (e) {
        // fallback send by URL
        buffer = null;
      }

      const botName = config.botName.toUpperCase();

      // SEND VIDEO
      if (buffer && buffer.length > 0) {
        await sock.sendMessage(msg.key.remoteJid, {
          video: buffer,
          mimetype: 'video/mp4',
          caption:
`🎬 *TikTok Downloaded*

${title ? `📝 ${title}\n\n` : ''}
🤖 Downloaded by *Mathithibala_Bot*
👨‍🏫 Produced by *Professor Sahil*`
        }, { quoted: msg });

      } else {
        await sock.sendMessage(msg.key.remoteJid, {
          video: { url: videoUrl },
          mimetype: 'video/mp4',
          caption:
`🎬 *TikTok Downloaded*

${title ? `📝 ${title}\n\n` : ''}
🤖 Downloaded by *Mathithibala_Bot*
👨‍🏫 Produced by *Professor Sahil*`
        }, { quoted: msg });
      }

    } catch (err) {
      console.error('TikTok command error:', err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to download TikTok video. Please try again.'
      }, { quoted: msg });
    }
  }
};
