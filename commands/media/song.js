/**
 * Song Downloader - Download audio from YouTube
 * Enhanced by Professor Sahil
 */

const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const APIs = require('../../utils/api');
const { toAudio } = require('../../utils/converter');

module.exports = {
  name: 'song',
  aliases: ['play', 'music', 'yta'],
  category: 'media',
  description: 'Download audio from YouTube',
  usage: '.song <song name or YouTube link>',

  async execute(sock, msg, args) {
    try {
      const text = args.join(' ');
      const chatId = msg.key.remoteJid;

      if (!text) {
        return sock.sendMessage(chatId, {
          text: 'Usage: .song <song name or YouTube link>'
        }, { quoted: msg });
      }

      // 🎧 WAIT MESSAGE (AI SIMULATION)
      const waitMsg = await sock.sendMessage(chatId, {
        text: `⏳ *Wait... Sahil's AI is downloading the song for you*\n\n🎧 Please hold on (~30 seconds)\n⚡ Processing your request...`
      }, { quoted: msg });

      let video;

      // 🔥 Handle MIX / PLAYLIST LINKS
      const isPlaylist = text.includes('list=') || text.includes('mix') || text.includes('playlist');

      if (text.includes('youtube.com') || text.includes('youtu.be')) {
        if (isPlaylist) {
          // Try to fallback to first playable video via search
          const searchQuery = text.split('v=')[1]?.split('&')[0] || text;
          const search = await yts(searchQuery);

          if (!search || !search.videos.length) {
            return sock.sendMessage(chatId, {
              text: '❌ Cannot process MIX/Playlist link.'
            }, { quoted: msg });
          }

          video = search.videos[0];
        } else {
          video = { url: text };
        }
      } else {
        const search = await yts(text);

        if (!search || !search.videos.length) {
          return sock.sendMessage(chatId, {
            text: 'No results found.'
          }, { quoted: msg });
        }

        video = search.videos[0];
      }

      // 🎵 Update message
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption: `🎵 *Downloading:* ${video.title}\n⏱ Duration: ${video.timestamp}`
      }, { quoted: msg });

      let audioData;
      let audioBuffer;
      let success = false;

      const apiMethods = [
        { name: 'EliteProTech', method: () => APIs.getEliteProTechDownloadByUrl(video.url) },
        { name: 'Yupra', method: () => APIs.getYupraDownloadByUrl(video.url) },
        { name: 'Okatsu', method: () => APIs.getOkatsuDownloadByUrl(video.url) },
        { name: 'Izumi', method: () => APIs.getIzumiDownloadByUrl(video.url) }
      ];

      for (const api of apiMethods) {
        try {
          audioData = await api.method();
          const url = audioData.download || audioData.dl || audioData.url;

          if (!url) continue;

          try {
            const res = await axios.get(url, {
              responseType: 'arraybuffer',
              timeout: 90000
            });

            audioBuffer = Buffer.from(res.data);

            if (audioBuffer.length > 0) {
              success = true;
              break;
            }
          } catch (e) {
            continue;
          }

        } catch (e) {
          continue;
        }
      }

      if (!success) {
        throw new Error('All download sources failed');
      }

      // 🎧 Convert if needed
      let finalBuffer = audioBuffer;

      try {
        finalBuffer = await toAudio(audioBuffer, 'mp3');
      } catch (e) {
        // fallback keep original
      }

      // 🟢 SEND SONG
      await sock.sendMessage(chatId, {
        audio: finalBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
        ptt: false
      }, { quoted: msg });

      // 🏁 FINAL SUCCESS MESSAGE
      await sock.sendMessage(chatId, {
        text:
`✅ *DOWNLOAD COMPLETE!*

🎵 ${video.title}

🤖 Successfully downloaded by *Mathithibala_Bot*
👨‍🏫 Produced by *Professor Sahil*`
      });

    } catch (err) {
      console.error('Song command error:', err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to download song. Try again later.'
      }, { quoted: msg });
    }
  }
};
