/**
 * Song Downloader - Ultra Pro Version
 * Enhanced by Professor Sahil
 */

const yts = require('yt-search');
const axios = require('axios');
const APIs = require('../../utils/api');
const { toAudio } = require('../../utils/converter');

module.exports = {
  name: 'song',
  aliases: ['play', 'music', 'yta'],
  category: 'media',
  description: 'Download audio from YouTube (Pro Mode)',
  usage: '.song <name or URL>',

  async execute(sock, msg, args) {
    try {
      const text = args.join(' ');
      const chatId = msg.key.remoteJid;

      if (!text) {
        return sock.sendMessage(chatId, {
          text: '❌ Usage: .song <song name or YouTube link>'
        }, { quoted: msg });
      }

      // ⚡ START MESSAGE
      await sock.sendMessage(chatId, {
        text:
`⏳ *Wait... Sahil AI is processing your request*
🎧 Downloading song...
⚡ Estimated time: ~20-30 seconds`
      }, { quoted: msg });

      let video;

      // 🔥 Detect playlist / MIX / radio / long links
      const isPlaylist =
        text.includes('list=') ||
        text.includes('mix') ||
        text.includes('playlist') ||
        text.includes('&list');

      if (text.includes('youtu')) {
        if (isPlaylist) {
          const search = await yts(text);

          if (!search?.videos?.length) {
            return sock.sendMessage(chatId, {
              text: '❌ Cannot process playlist/MIX link. Try a single song link or name.'
            }, { quoted: msg });
          }

          video = search.videos[0]; // fallback first playable
        } else {
          video = { url: text };
        }
      } else {
        const search = await yts(text);

        if (!search?.videos?.length) {
          return sock.sendMessage(chatId, {
            text: '❌ No results found for your query.'
          }, { quoted: msg });
        }

        video = search.videos[0];
      }

      // 🎵 SHOW INFO
      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption:
`🎵 *${video.title}*
⏱ Duration: ${video.timestamp || 'Unknown'}

🤖 Processing download...`
      }, { quoted: msg });

      let audioBuffer;
      let success = false;

      // 🔁 API fallback chain (safe & fast)
      const apiMethods = [
        () => APIs.getEliteProTechDownloadByUrl(video.url),
        () => APIs.getYupraDownloadByUrl(video.url),
        () => APIs.getOkatsuDownloadByUrl(video.url),
        () => APIs.getIzumiDownloadByUrl(video.url)
      ];

      for (const method of apiMethods) {
        try {
          const data = await method();
          const url = data?.download || data?.url || data?.dl;

          if (!url) continue;

          const res = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 90000
          });

          audioBuffer = Buffer.from(res.data);

          if (audioBuffer?.length > 0) {
            success = true;
            break;
          }

        } catch (e) {
          continue;
        }
      }

      if (!success) {
        return sock.sendMessage(chatId, {
          text: '❌ All download sources failed. Please try another song.'
        }, { quoted: msg });
      }

      // 🎧 Convert safely
      let finalBuffer = audioBuffer;

      try {
        finalBuffer = await toAudio(audioBuffer, 'mp3');
      } catch (e) {
        finalBuffer = audioBuffer;
      }

      // 🎧 SEND AUDIO
      await sock.sendMessage(chatId, {
        audio: finalBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
        ptt: false
      }, { quoted: msg });

      // 🏁 FINAL SUCCESS MESSAGE (UPGRADED BRANDING)
      await sock.sendMessage(chatId, {
        text:
`✅ *DOWNLOAD COMPLETE*

🎵 Song: ${video.title}

🤖 Successfully downloaded by *Mathithibala_Bot*
👨‍🏫 Produced by *Professor Sahil*
⚡ Powered by Sahil Pro System`
      });

    } catch (err) {
      console.error('Song Error:', err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Error occurred while downloading song. Try again.'
      }, { quoted: msg });
    }
  }
};
