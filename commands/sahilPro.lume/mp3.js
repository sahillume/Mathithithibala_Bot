/**
 * 🎵 Mathithibala_Bot MP3 Downloader (PRO STABLE)
 * Folder: commands/sahilPro.lume/
 * Author: Professor Sahil
 */

const yts = require('yt-search');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const APIs = require('../../utils/api');
const { toAudio } = require('../../utils/converter');

const AXIOS_CONFIG = {
  timeout: 60000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

module.exports = {
  name: 'song',
  aliases: ['play', 'music', 'yta'],
  category: 'media',
  description: 'Download audio from YouTube',
  usage: '.song <name or url>',

  async execute(sock, msg, args) {
    try {
      const text = args.join(' ').trim();
      const chatId = msg.key.remoteJid;

      if (!text) {
        return sock.sendMessage(chatId, {
          text: '📌 Usage: .song <song name or YouTube link>'
        }, { quoted: msg });
      }

      // ===============================
      // 🔎 SEARCH OR DIRECT LINK
      // ===============================
      let video;

      if (text.includes('youtu')) {
        video = { url: text };
      } else {
        const search = await yts(text);
        if (!search?.videos?.length) {
          return sock.sendMessage(chatId, {
            text: '❌ No results found.'
          }, { quoted: msg });
        }
        video = search.videos[0];
      }

      // ===============================
      // 🎧 INFO MESSAGE
      // ===============================
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption:
`🎵 *Downloading Song*

🎧 ${video.title}
⏱ ${video.timestamp}

🤖 Mathithibala_Bot`
      }, { quoted: msg });

      // ===============================
      // 🌐 DOWNLOAD ENGINE (SAFE)
      // ===============================
      const apiMethods = [
        () => APIs.getEliteProTechDownloadByUrl(video.url),
        () => APIs.getYupraDownloadByUrl(video.url),
        () => APIs.getOkatsuDownloadByUrl(video.url),
        () => APIs.getIzumiDownloadByUrl(video.url)
      ];

      let buffer = null;
      let data = null;

      for (const fn of apiMethods) {
        try {
          const res = await fn();
          const url = res?.download || res?.url || res?.dl;
          if (!url) continue;

          const file = await axios.get(url, {
            ...AXIOS_CONFIG,
            responseType: 'arraybuffer'
          });

          buffer = Buffer.from(file.data);

          if (buffer?.length > 10000) {
            data = res;
            break;
          }

        } catch {
          continue;
        }
      }

      if (!buffer) {
        throw new Error('All download sources failed');
      }

      // ===============================
      // 🎧 FORMAT CHECK (SIMPLIFIED)
      // ===============================
      const isMP3 =
        buffer.toString('ascii', 0, 3) === 'ID3' ||
        buffer[0] === 0xFF;

      let finalBuffer = buffer;

      if (!isMP3) {
        try {
          finalBuffer = await toAudio(buffer, 'm4a');
        } catch {
          finalBuffer = buffer;
        }
      }

      // ===============================
      // 📤 SEND AUDIO
      // ===============================
      await sock.sendMessage(chatId, {
        audio: finalBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${(data?.title || video.title || 'song')
          .replace(/[^\w\s-]/g, '')}.mp3`,
        ptt: false
      }, { quoted: msg });

      // ===============================
      // 🧹 CLEAN TEMP (SAFE)
      // ===============================
      try {
        const temp = path.join(__dirname, '../../temp');
        if (fs.existsSync(temp)) {
          fs.readdirSync(temp).forEach(f => {
            const fp = path.join(temp, f);
            try {
              if (Date.now() - fs.statSync(fp).mtimeMs > 15000) {
                fs.unlinkSync(fp);
              }
            } catch {}
          });
        }
      } catch {}

    } catch (err) {
      console.log('❌ Song Error:', err.message);

      return sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to download song. Try again later.'
      }, { quoted: msg });
    }
  }
};
