/**
 * 🎵 Song Downloader - ULTRA STABLE VERSION (FIXED)
 * Multi API + Safe Buffer + Clean Fallback
 */

const yts = require("yt-search");
const axios = require("axios");

module.exports = {
  name: "song",
  aliases: ["play", "music", "yta"],
  category: "media",
  description: "Download audio from YouTube (Stable Pro Fix)",

  async execute(sock, msg, args) {
    try {
      const text = args.join(" ");
      const chatId = msg.key.remoteJid;

      if (!text) {
        return sock.sendMessage(chatId, {
          text: "❌ Usage: .song <song name>"
        }, { quoted: msg });
      }

      await sock.sendMessage(chatId, {
        text: "⏳ Searching song..."
      }, { quoted: msg });

      // 🔍 SEARCH
      const search = await yts(text);
      if (!search?.videos?.length) {
        return sock.sendMessage(chatId, {
          text: "❌ No results found."
        }, { quoted: msg });
      }

      const video = search.videos[0];

      await sock.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption: `🎵 *${video.title}*\n⏱ ${video.timestamp}\n\n⏳ Downloading...`
      }, { quoted: msg });

      // ===============================
      // 🔁 SAFE API FALLBACK SYSTEM
      // ===============================

      const apis = [
        async () => {
          try {
            const res = await axios.get(
              "https://api.siputzx.my.id/api/d/ytmp3",
              { params: { url: video.url }, timeout: 20000 }
            );
            return res.data?.data?.dl;
          } catch {
            return null;
          }
        },

        async () => {
          try {
            return `https://api.vevioz.com/api/button/mp3/${video.url}`;
          } catch {
            return null;
          }
        }
      ];

      let downloadUrl = null;

      for (const api of apis) {
        try {
          const url = await api();
          if (url) {
            downloadUrl = url;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!downloadUrl) {
        return sock.sendMessage(chatId, {
          text: "❌ All download servers failed. Try again later."
        }, { quoted: msg });
      }

      // ===============================
      // 🎧 DOWNLOAD AUDIO (SAFE MODE)
      // ===============================

      let audioBuffer;

      try {
        const audio = await axios.get(downloadUrl, {
          responseType: "arraybuffer",
          timeout: 60000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            Accept: "*/*"
          }
        });

        audioBuffer = Buffer.from(audio.data);
      } catch (err) {
        console.log("Download error:", err.message);
      }

      // 🧠 VALIDATION FIX
      if (!audioBuffer || audioBuffer.length < 1000) {
        return sock.sendMessage(chatId, {
          text: "❌ Failed to get valid audio file. Try another song."
        }, { quoted: msg });
      }

      // ===============================
      // 📤 SEND AUDIO
      // ===============================

      await sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        fileName: `${video.title}.mp3`
      }, { quoted: msg });

      await sock.sendMessage(chatId, {
        text: `✅ Done!\n🎵 ${video.title}\n\n🤖 Mathithibala Bot`
      });

    } catch (err) {
      console.log("Song Command Error:", err);

      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Song download failed. Please try another one."
      });
    }
  }
};
