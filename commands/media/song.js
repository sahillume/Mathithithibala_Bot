/**
 * 🎵 Song Downloader - PRO STABLE VERSION
 * Multi API Fallback System
 */

const yts = require('yt-search');
const axios = require('axios');

module.exports = {
  name: 'song',
  aliases: ['play', 'music', 'yta'],
  category: 'media',
  description: 'Download audio from YouTube (Stable)',

  async execute(sock, msg, args) {
    try {
      const text = args.join(' ');
      const chatId = msg.key.remoteJid;

      if (!text) {
        return sock.sendMessage(chatId, {
          text: '❌ Usage: .song <song name>'
        }, { quoted: msg });
      }

      await sock.sendMessage(chatId, {
        text: '⏳ Searching your song...'
      }, { quoted: msg });

      // 🔍 SEARCH
      const search = await yts(text);
      if (!search?.videos?.length) {
        return sock.sendMessage(chatId, {
          text: '❌ No results found.'
        }, { quoted: msg });
      }

      const video = search.videos[0];

      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption: `🎵 *${video.title}*\n⏱ ${video.timestamp}\n\n⏳ Downloading...`
      }, { quoted: msg });

      let downloadUrl = null;

      // ===============================
      // 🔁 MULTI API FALLBACK
      // ===============================

      const apis = [
        async () => {
          const res = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3`, {
            params: { url: video.url }
          });
          return res.data?.data?.dl;
        },

        async () => {
          const res = await axios.get(`https://api.vevioz.com/api/button/mp3/${video.url}`);
          return `https://api.vevioz.com/api/button/mp3/${video.url}`;
        },

        async () => {
          const res = await axios.get(`https://yt1s.io/api/ajaxSearch/index`, {
            params: { q: video.url, vt: 'home' }
          });
          return null; // fallback skip (yt1s harder)
        }
      ];

      // 🔁 TRY ALL APIs
      for (const api of apis) {
        try {
          const url = await api();
          if (url) {
            downloadUrl = url;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!downloadUrl) {
        return sock.sendMessage(chatId, {
          text: '❌ All download servers failed. Try another song.'
        }, { quoted: msg });
      }

      // ===============================
      // 🎧 DOWNLOAD AUDIO
      // ===============================
      const audio = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 90000
      });

      const buffer = Buffer.from(audio.data);

      if (!buffer || buffer.length < 1000) {
        return sock.sendMessage(chatId, {
          text: '❌ Invalid audio received.'
        }, { quoted: msg });
      }

      // ===============================
      // 📤 SEND AUDIO
      // ===============================
      await sock.sendMessage(chatId, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      }, { quoted: msg });

      await sock.sendMessage(chatId, {
        text: `✅ Downloaded:\n🎵 ${video.title}\n\n🤖 Mathithibala Bot\n👨‍🏫 Professor Sahil`
      });

    } catch (err) {
      console.log('Song Error:', err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to download song. Try again.'
      });
    }
  }
};
