/**
 * Song Downloader - FIXED PRO VERSION
 */

const yts = require('yt-search');
const axios = require('axios');

module.exports = {
  name: 'song',
  aliases: ['play', 'music', 'yta'],
  category: 'media',
  description: 'Download audio from YouTube',

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
        text: '⏳ Searching & preparing your song...'
      }, { quoted: msg });

      // ===============================
      // 🔍 SEARCH YOUTUBE
      // ===============================
      const search = await yts(text);

      if (!search?.videos?.length) {
        return sock.sendMessage(chatId, {
          text: '❌ No results found.'
        }, { quoted: msg });
      }

      const video = search.videos[0];

      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption:
`🎵 *${video.title}*
⏱ Duration: ${video.timestamp}

⏳ Downloading audio...`
      }, { quoted: msg });

      // ===============================
      // 🔥 FIXED DOWNLOAD API
      // ===============================
      const apiURL = `https://api.giftedtech.web.id/api/download/ytmp3?url=${encodeURIComponent(video.url)}`;

      const res = await axios.get(apiURL, { timeout: 60000 });

      const downloadUrl =
        res.data?.result?.download_url ||
        res.data?.result?.url ||
        res.data?.download_url;

      if (!downloadUrl) {
        return sock.sendMessage(chatId, {
          text: '❌ Download link failed. Try another song.'
        }, { quoted: msg });
      }

      // ===============================
      // 🎧 FETCH AUDIO
      // ===============================
      const audioBuffer = await axios.get(downloadUrl, {
        responseType: 'arraybuffer'
      });

      // ===============================
      // 📤 SEND AUDIO
      // ===============================
      await sock.sendMessage(chatId, {
        audio: Buffer.from(audioBuffer.data),
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      }, { quoted: msg });

      await sock.sendMessage(chatId, {
        text:
`✅ *DOWNLOAD COMPLETE*

🎵 ${video.title}
🤖 Mathithibala Bot
👨‍🏫 Professor Sahil`
      });

    } catch (err) {
      console.log('Song Error:', err.message);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Song download failed. Try again later.'
      });
    }
  }
};
