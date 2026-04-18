/**
 * Instagram Downloader - Using ruhend-scraper (FIXED VERSION)
 */

const { igdl } = require('ruhend-scraper');
const config = require('../../config');

// Store processed message IDs with timestamp (prevents memory leak)
const processedMessages = new Map();

// Clean old messages every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, time] of processedMessages.entries()) {
    if (now - time > 5 * 60 * 1000) {
      processedMessages.delete(id);
    }
  }
}, 10 * 60 * 1000);

// Extract Instagram URL from any text
function extractInstagramUrl(text) {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s]+instagram\.com[^\s]*/i);
  return match ? match[0] : null;
}

// Simple deduplication
function extractUniqueMedia(mediaData) {
  const seen = new Set();
  const result = [];

  for (const media of mediaData || []) {
    if (!media?.url) continue;

    if (!seen.has(media.url)) {
      seen.add(media.url);
      result.push(media);
    }
  }

  return result;
}

module.exports = {
  name: 'instagram',
  aliases: ['ig', 'insta', 'igdl', 'reels'],
  category: 'media',
  description: 'Download Instagram photos/videos/reels',
  usage: '<Instagram URL>',

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      // Prevent duplicate processing
      if (processedMessages.has(msg.key.id)) return;
      processedMessages.set(msg.key.id, Date.now());

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        args.join(' ');

      const url = extractInstagramUrl(text);

      if (!url) {
        return extra.reply(
          '❌ Please send a valid Instagram post, reel, or video link.'
        );
      }

      await sock.sendMessage(chatId, {
        react: { text: '📥', key: msg.key }
      });

      let downloadData;
      try {
        downloadData = await igdl(url);
      } catch (err) {
        console.error("igdl error:", err);
        return extra.reply('❌ Failed to fetch Instagram media.');
      }

      if (!downloadData?.data?.length) {
        return extra.reply(
          '❌ No media found. The post may be private or invalid.'
        );
      }

      const mediaList = extractUniqueMedia(downloadData.data).slice(0, 20);

      if (!mediaList.length) {
        return extra.reply('❌ No valid media to download.');
      }

      const botName = (config.botName || 'BOT').toUpperCase();

      for (let i = 0; i < mediaList.length; i++) {
        try {
          const media = mediaList[i];
          const mediaUrl = media?.url;

          if (!mediaUrl) continue;

          const isVideo =
            media.type === 'video' ||
            /\.(mp4|mov|webm|mkv)$/i.test(mediaUrl) ||
            url.includes('/reel/') ||
            url.includes('/tv/');

          const messagePayload = isVideo
            ? {
                video: { url: mediaUrl },
                mimetype: 'video/mp4',
                caption: `*DOWNLOADED BY ${botName}*`
              }
            : {
                image: { url: mediaUrl },
                caption: `*DOWNLOADED BY ${botName}*`
              };

          await sock.sendMessage(chatId, messagePayload, { quoted: msg });

          // delay to avoid rate limits
          if (i < mediaList.length - 1) {
            await new Promise((r) => setTimeout(r, 900));
          }
        } catch (err) {
          console.error(`Media ${i + 1} error:`, err.message);
        }
      }
    } catch (error) {
      console.error('Instagram command error:', error);
      return extra.reply('❌ Something went wrong while processing the link.');
    }
  }
};
