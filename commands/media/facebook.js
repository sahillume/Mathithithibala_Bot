/**
 * Facebook Downloader - Advanced Stable Version
 */

const { facebookdl } = require('@bochilteam/scraper-facebook');
const axios = require('axios');
const config = require('../../config');

module.exports = {
  name: 'facebook',
  aliases: ['fb', 'fbdl', 'facebookdl'],
  category: 'media',
  description: 'Download Facebook videos',
  usage: '.facebook <url>',

  async execute(sock, msg, args, extra) {
    try {
      const url = args.join(' ').trim();

      if (!url) {
        return extra.reply('❌ Usage: .facebook <Facebook URL>');
      }

      // ===============================
      // VALIDATION
      // ===============================
      const fbRegex = /(facebook\.com|fb\.watch)/i;
      if (!fbRegex.test(url)) {
        return extra.reply('❌ Please provide a valid Facebook video link.');
      }

      await sock.sendMessage(extra.from, {
        react: { text: '⏳', key: msg.key }
      });

      // ===============================
      // FETCH DATA
      // ===============================
      const data = await facebookdl(url);

      if (!data?.video?.length) {
        return extra.reply('❌ No video found in this link.');
      }

      const video = data.video[0];

      if (!video?.download) {
        return extra.reply('❌ Video format not supported.');
      }

      const videoData = await video.download();

      let buffer = null;
      let videoUrl = null;

      // ===============================
      // HANDLE RESPONSE TYPE
      // ===============================
      if (Buffer.isBuffer(videoData)) {
        buffer = videoData;
      } else if (typeof videoData === 'string') {
        videoUrl = videoData;
      } else if (videoData?.url) {
        videoUrl = videoData.url;
      }

      const caption =
`📥 *FACEBOOK DOWNLOAD*
━━━━━━━━━━━━━━━
🤖 Bot: ${config.botName}
⏱️ Duration: ${data.duration || 'Unknown'}
🎬 Quality: ${video.quality || 'HD'}
━━━━━━━━━━━━━━━`;

      // ===============================
      // SEND VIDEO (SMART FALLBACK)
      // ===============================
      try {
        if (buffer) {
          await sock.sendMessage(extra.from, {
            video: buffer,
            mimetype: 'video/mp4',
            caption
          }, { quoted: msg });

        } else if (videoUrl) {
          await sock.sendMessage(extra.from, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption
          }, { quoted: msg });

        } else {
          throw new Error('No valid video source found');
        }

      } catch (sendError) {
        // FINAL FALLBACK: DOWNLOAD MANUALLY
        const res = await axios.get(videoUrl, {
          responseType: 'arraybuffer',
          timeout: 60000,
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://facebook.com'
          }
        });

        await sock.sendMessage(extra.from, {
          video: Buffer.from(res.data),
          mimetype: 'video/mp4',
          caption
        }, { quoted: msg });
      }

      await sock.sendMessage(extra.from, {
        react: { text: '✅', key: msg.key }
      });

    } catch (error) {
      console.error('[FacebookDL]', error);

      await extra.reply(
        `❌ Download failed\n\nReason: ${error.message}\n\nTry another link.`
      );
    }
  }
};
