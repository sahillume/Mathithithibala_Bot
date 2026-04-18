/**
 * YouTube Video Downloader - Improved Version
 * Powered by Mathithibala_Bot | Professor Sahil AI
 */

const yts = require('yt-search');
const APIs = require('../../utils/api');
const config = require('../../config');

module.exports = {
  name: 'ytvideo',
  aliases: ['ytv', 'ytmp4', 'ytvid', 'video'],
  category: 'media',
  description: 'Download video from YouTube',
  usage: '.video <video name or URL>',

  async execute(sock, msg, args) {
    try {
      const text = args.join(' ').trim();
      const chatId = msg.key.remoteJid;

      if (!text) {
        return sock.sendMessage(chatId, {
          text: '❌ Please provide a YouTube name or link.'
        }, { quoted: msg });
      }

      // ⏳ WAIT MESSAGE (Sahil AI STYLE)
      await sock.sendMessage(chatId, {
        text:
`⏳ *Wait... Sahil AI is processing your video*

🎬 Searching & downloading...
⚡ Please wait ~30 seconds`
      }, { quoted: msg });

      let videoUrl, videoTitle, videoThumbnail;

      // 🔍 SEARCH OR DIRECT LINK
      const isLink = text.includes('youtube.com') || text.includes('youtu.be');

      if (isLink) {
        videoUrl = text;
      } else {
        const search = await yts(text);

        if (!search?.videos?.length) {
          return sock.sendMessage(chatId, {
            text: '❌ No video found.'
          }, { quoted: msg });
        }

        const v = search.videos[0];
        videoUrl = v.url;
        videoTitle = v.title;
        videoThumbnail = v.thumbnail;
      }

      // 📸 SEND THUMBNAIL
      try {
        if (videoThumbnail) {
          await sock.sendMessage(chatId, {
            image: { url: videoThumbnail },
            caption: `🎬 *${videoTitle || 'YouTube Video'}*\n\n⏳ Downloading...`
          }, { quoted: msg });
        }
      } catch {}

      // 🔁 API FALLBACK CHAIN
      let videoData;

      const apiList = [
        () => APIs.getEliteProTechVideoByUrl(videoUrl),
        () => APIs.getYupraVideoByUrl(videoUrl),
        () => APIs.getOkatsuVideoByUrl(videoUrl)
      ];

      for (const api of apiList) {
        try {
          videoData = await api();
          if (videoData?.download) break;
        } catch {}
      }

      if (!videoData?.download) {
        return sock.sendMessage(chatId, {
          text: '❌ Failed to fetch video download link.'
        }, { quoted: msg });
      }

      const botName = config.botName.toUpperCase();

      // 🎬 SEND VIDEO
      await sock.sendMessage(chatId, {
        video: { url: videoData.download },
        mimetype: 'video/mp4',
        fileName: `${(videoData.title || videoTitle || 'video')
          .replace(/[^\w\s-]/g, '')}.mp4`,
        caption:
`🎬 *DOWNLOAD COMPLETE*

📝 ${videoData.title || videoTitle || 'YouTube Video'}

🤖 Downloaded by *Mathithibala_Bot*
👨‍🏫 Produced by *Professor Sahil*`
      }, { quoted: msg });

    } catch (error) {
      console.error('[YT VIDEO ERROR]:', error);

      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Download failed. Please try again later.'
      }, { quoted: msg });
    }
  }
};
